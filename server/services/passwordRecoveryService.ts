import { getDb } from '../db';
import { passwordRecovery, users } from '../../drizzle/schema';
import { eq, and, gte } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { sendEmail } from '../email';

/**
 * PasswordRecoveryService - Handles password reset via email
 * 
 * Features:
 * - Generate secure reset tokens
 * - Send reset emails
 * - Verify reset tokens
 * - Reset password with token
 * - Token expiration (24 hours)
 * - Rate limiting (max 3 requests per hour)
 */

const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_HOUR = 3;

export class PasswordRecoveryService {
  /**
   * Generate a secure reset token
   */
  static generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Request password reset
   */
  static async requestReset(email: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not connected');

      // Find user by email
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        // Don't reveal if email exists - for security
        return {
          success: true,
          message: 'If an account exists with this email, a reset link has been sent.',
        };
      }

      // Check rate limiting
      const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
      const recentRequests = await db
        .select()
        .from(passwordRecovery)
        .where(
          and(
            eq(passwordRecovery.userId, user.id),
            gte(passwordRecovery.createdAt, oneHourAgo.toISOString())
          )
        );

      if (recentRequests.length >= MAX_REQUESTS_PER_HOUR) {
        return {
          success: false,
          message: 'Too many reset requests. Please try again later.',
        };
      }

      // Generate token
      const token = this.generateToken();
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MS);

      // Store token in database
      await db.insert(passwordRecovery).values({
        userId: user.id,
        token,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
      });

      // Send reset email
      const resetUrl = `${process.env.FRONTEND_URL || 'https://vendhub.local'}/reset-password?token=${token}`;
      const emailHtml = `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name || 'User'},</p>
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        <p><a href="${resetUrl}" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p>Best regards,<br/>VendHub Manager Team</p>
      `;
      
      await sendEmail({
        to: user.email || email,
        subject: 'Password Reset Request - VendHub Manager',
        html: emailHtml,
      });

      return {
        success: true,
        message: 'If an account exists with this email, a reset link has been sent.',
      };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }

  /**
   * Verify reset token
   */
  static async verifyToken(token: string): Promise<{
    valid: boolean;
    userId?: number;
    message?: string;
  }> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not connected');

      const now = new Date();

      const resetRecord = await db
        .select()
        .from(passwordRecovery)
        .where(
          and(
            eq(passwordRecovery.token, token),
            gte(passwordRecovery.expiresAt, now.toISOString())
          )
        )
        .limit(1);

      if (resetRecord.length === 0) {
        return {
          valid: false,
          message: 'Reset token is invalid or has expired.',
        };
      }

      // Check if token was already used
      if (resetRecord[0].usedAt) {
        return {
          valid: false,
          message: 'Reset token has already been used.',
        };
      }

      return {
        valid: true,
        userId: resetRecord[0].userId,
      };
    } catch (error) {
      console.error('Error verifying reset token:', error);
      return {
        valid: false,
        message: 'Error verifying reset token.',
      };
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not connected');

      // Verify token
      const verification = await this.verifyToken(token);
      if (!verification.valid || !verification.userId) {
        return {
          success: false,
          message: verification.message || 'Invalid or expired reset token.',
        };
      }

      // Import PasswordService to hash the password
      const { PasswordService } = await import('./passwordService');

      // Validate password strength
      const validation = PasswordService.validatePassword(newPassword);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.error,
        };
      }

      // Hash new password
      const passwordHash = await PasswordService.hashPassword(newPassword);

      // Update user password
      await db.update(users).set({
        passwordHash,
        updatedAt: new Date().toISOString(),
      }).where(eq(users.id, verification.userId));

      // Mark token as used
      await db.update(passwordRecovery).set({
        usedAt: new Date().toISOString(),
      }).where(eq(passwordRecovery.token, token));

      return {
        success: true,
        message: 'Password reset successfully. Please log in with your new password.',
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  /**
   * Clean up expired tokens
   */
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      const db = await getDb();
      if (!db) return;

      const now = new Date();

      await db
        .delete(passwordRecovery)
        .where(
          and(
            gte(passwordRecovery.expiresAt, now.toISOString()),
            eq(passwordRecovery.usedAt, null as any)
          )
        );
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      // Don't throw - this is cleanup
    }
  }

  /**
   * Get recovery status for a user
   */
  static async getRecoveryStatus(userId: number) {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not connected');

      const now = new Date();
      const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

      const recentRequests = await db
        .select()
        .from(passwordRecovery)
        .where(
          and(
            eq(passwordRecovery.userId, userId),
            gte(passwordRecovery.createdAt, oneHourAgo.toISOString())
          )
        );

      return {
        userId,
        recentRequestCount: recentRequests.length,
        canRequestReset: recentRequests.length < MAX_REQUESTS_PER_HOUR,
        remainingRequests: Math.max(0, MAX_REQUESTS_PER_HOUR - recentRequests.length),
      };
    } catch (error) {
      console.error('Error getting recovery status:', error);
      return {
        userId,
        recentRequestCount: 0,
        canRequestReset: true,
        remainingRequests: MAX_REQUESTS_PER_HOUR,
      };
    }
  }
}
