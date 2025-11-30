import { getDb } from '../db';
import { loginAttempts } from '../../drizzle/schema';
import { eq, and, gte, lt } from 'drizzle-orm';

/**
 * LoginAttemptService - Handles brute-force protection
 * 
 * Rules:
 * - Track failed login attempts per user and IP
 * - Lock account after 5 failed attempts
 * - Lockout duration: 15 minutes
 * - Clear attempts after successful login
 */

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW_MS = 60 * 60 * 1000; // 1 hour - clear old attempts after this

export class LoginAttemptService {
  /**
   * Record a login attempt
   */
  static async recordAttempt(
    email: string,
    ipAddress: string,
    userAgent: string,
    status: 'success' | 'failed' | 'locked',
    failureReason?: string,
    userId?: number
  ) {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not connected');
      
      const now = new Date();
      const lockoutUntil = status === 'locked' 
        ? new Date(now.getTime() + LOCKOUT_DURATION_MS)
        : null;

      await db.insert(loginAttempts).values({
        userId: userId || null,
        email,
        ipAddress,
        userAgent,
        status,
        failureReason: failureReason || null,
        attemptNumber: 1,
        lockoutUntil: lockoutUntil ? lockoutUntil.toISOString() : null,
        createdAt: now.toISOString(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error recording login attempt:', error);
      throw error;
    }
  }

  /**
   * Check if account/IP is locked
   */
  static async isLocked(email: string, ipAddress: string): Promise<boolean> {
    try {
      const db = await getDb();
      if (!db) return false;
      
      const now = new Date();
      
      // Check for active lockout
      const lockedAttempt = await db
        .select()
        .from(loginAttempts)
        .where(
          and(
            eq(loginAttempts.email, email),
            eq(loginAttempts.status, 'locked'),
            gte(loginAttempts.lockoutUntil, now.toISOString())
          )
        )
        .limit(1);

      return lockedAttempt.length > 0;
    } catch (error) {
      console.error('Error checking lockout status:', error);
      return false; // Fail open - don't lock on error
    }
  }

  /**
   * Get failed attempt count for email
   */
  static async getFailedAttemptCount(email: string): Promise<number> {
    try {
      const db = await getDb();
      if (!db) return 0;
      
      const oneHourAgo = new Date(Date.now() - ATTEMPT_WINDOW_MS);
      
      const attempts = await db
        .select()
        .from(loginAttempts)
        .where(
          and(
            eq(loginAttempts.email, email),
            eq(loginAttempts.status, 'failed'),
            gte(loginAttempts.createdAt, oneHourAgo.toISOString())
          )
        );

      return attempts.length;
    } catch (error) {
      console.error('Error getting failed attempt count:', error);
      return 0;
    }
  }

  /**
   * Check if login should be blocked due to too many failed attempts
   */
  static async shouldBlockLogin(email: string, ipAddress: string): Promise<{
    blocked: boolean;
    reason?: string;
    lockoutUntil?: Date;
  }> {
    try {
      const db = await getDb();
      if (!db) return { blocked: false };
      
      // Check if already locked
      const isLocked = await this.isLocked(email, ipAddress);
      if (isLocked) {
        const lockedAttempt = await db
          .select()
          .from(loginAttempts)
          .where(
            and(
              eq(loginAttempts.email, email),
              eq(loginAttempts.status, 'locked')
            )
          )
          .orderBy((t) => t.createdAt)
          .limit(1);

        if (lockedAttempt.length > 0 && lockedAttempt[0].lockoutUntil) {
          return {
            blocked: true,
            reason: 'Account locked due to too many failed login attempts',
            lockoutUntil: new Date(lockedAttempt[0].lockoutUntil),
          };
        }
      }

      // Check failed attempt count
      const failedCount = await this.getFailedAttemptCount(email);
      if (failedCount >= MAX_FAILED_ATTEMPTS) {
        return {
          blocked: true,
          reason: 'Too many failed login attempts. Account locked for 15 minutes.',
          lockoutUntil: new Date(Date.now() + LOCKOUT_DURATION_MS),
        };
      }

      return { blocked: false };
    } catch (error) {
      console.error('Error checking if login should be blocked:', error);
      return { blocked: false }; // Fail open
    }
  }

  /**
   * Clear failed attempts after successful login
   */
  static async clearFailedAttempts(email: string): Promise<void> {
    try {
      const db = await getDb();
      if (!db) return;
      
      // Delete old failed attempts
      const oneHourAgo = new Date(Date.now() - ATTEMPT_WINDOW_MS);
      
      await db
        .delete(loginAttempts)
        .where(
          and(
            eq(loginAttempts.email, email),
            eq(loginAttempts.status, 'failed'),
            lt(loginAttempts.createdAt, oneHourAgo.toISOString())
          )
        );
    } catch (error) {
      console.error('Error clearing failed attempts:', error);
      // Don't throw - this is cleanup
    }
  }

  /**
   * Reset lockout for an account (admin action)
   */
  static async resetLockout(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not connected');
      
      await db
        .delete(loginAttempts)
        .where(
          and(
            eq(loginAttempts.email, email),
            eq(loginAttempts.status, 'locked')
          )
        );

      return { success: true, message: 'Account lockout reset' };
    } catch (error) {
      console.error('Error resetting lockout:', error);
      throw error;
    }
  }

  /**
   * Get login attempt history for a user
   */
  static async getAttemptHistory(email: string, limit: number = 10) {
    try {
      const db = await getDb();
      if (!db) return [];
      
      const attempts = await db
        .select()
        .from(loginAttempts)
        .where(eq(loginAttempts.email, email))
        .orderBy((t) => t.createdAt)
        .limit(limit);

      return attempts;
    } catch (error) {
      console.error('Error getting attempt history:', error);
      return [];
    }
  }

  /**
   * Get statistics for admin dashboard
   */
  static async getStatistics() {
    try {
      const db = await getDb();
      if (!db) {
        return {
          failedAttemptsLast24h: 0,
          lockedAccountsNow: 0,
          successfulAttemptsLast24h: 0,
          totalAttemptsLast24h: 0,
        };
      }
      
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const failedAttempts = await db
        .select()
        .from(loginAttempts)
        .where(
          and(
            eq(loginAttempts.status, 'failed'),
            gte(loginAttempts.createdAt, last24Hours.toISOString())
          )
        );

      const lockedAccounts = await db
        .select()
        .from(loginAttempts)
        .where(
          and(
            eq(loginAttempts.status, 'locked'),
            gte(loginAttempts.lockoutUntil, now.toISOString())
          )
        );

      const successfulAttempts = await db
        .select()
        .from(loginAttempts)
        .where(
          and(
            eq(loginAttempts.status, 'success'),
            gte(loginAttempts.createdAt, last24Hours.toISOString())
          )
        );

      return {
        failedAttemptsLast24h: failedAttempts.length,
        lockedAccountsNow: lockedAccounts.length,
        successfulAttemptsLast24h: successfulAttempts.length,
        totalAttemptsLast24h: failedAttempts.length + successfulAttempts.length,
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        failedAttemptsLast24h: 0,
        lockedAccountsNow: 0,
        successfulAttemptsLast24h: 0,
        totalAttemptsLast24h: 0,
      };
    }
  }
}
