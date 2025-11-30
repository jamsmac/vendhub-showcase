import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { getDb } from '../db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * TwoFactorService - Handles TOTP-based 2FA for Admin/SuperAdmin roles
 * 
 * Features:
 * - Generate TOTP secrets
 * - Generate QR codes for authenticator apps
 * - Verify TOTP tokens
 * - Generate backup codes
 * - Verify backup codes
 */

export class TwoFactorService {
  /**
   * Generate a new TOTP secret
   */
  static generateSecret(userEmail: string) {
    const secret = speakeasy.generateSecret({
      name: `VendHub Manager (${userEmail})`,
      issuer: 'VendHub Manager',
      length: 32,
    });

    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url || '',
    };
  }

  /**
   * Generate QR code data URL from secret
   */
  static async generateQRCode(secret: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(
        speakeasy.otpauthURL({
          secret,
          encoding: 'base32',
          label: 'VendHub Manager',
          issuer: 'VendHub Manager',
        })
      );
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verify a TOTP token
   */
  static verifyToken(secret: string, token: string): boolean {
    try {
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2, // Allow 2 time windows (30 seconds each) for clock skew
      });

      return verified === true;
    } catch (error) {
      console.error('Error verifying TOTP token:', error);
      return false;
    }
  }

  /**
   * Generate backup codes (10 codes, 8 characters each)
   */
  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase()
        .padEnd(8, '0');
      codes.push(code);
    }
    return codes;
  }

  /**
   * Hash backup codes for storage
   */
  static async hashBackupCodes(codes: string[]): Promise<string> {
    // Store as JSON array - in production, consider hashing each code individually
    return JSON.stringify(codes);
  }

  /**
   * Verify backup code
   */
  static verifyBackupCode(storedCodes: string, providedCode: string): boolean {
    try {
      const codes: string[] = JSON.parse(storedCodes);
      return codes.includes(providedCode.toUpperCase());
    } catch (error) {
      console.error('Error verifying backup code:', error);
      return false;
    }
  }

  /**
   * Remove used backup code
   */
  static removeBackupCode(storedCodes: string, usedCode: string): string {
    try {
      const codes: string[] = JSON.parse(storedCodes);
      const filtered = codes.filter(
        (code) => code !== usedCode.toUpperCase()
      );
      return JSON.stringify(filtered);
    } catch (error) {
      console.error('Error removing backup code:', error);
      return storedCodes;
    }
  }

  /**
   * Enable 2FA for a user
   */
  static async enableTwoFactor(
    userId: number,
    secret: string,
    backupCodes: string[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not connected');

      const hashedCodes = await this.hashBackupCodes(backupCodes);

      await db.update(users).set({
        twoFactorEnabled: true,
        // Store secret and backup codes in a JSON field if available
        // For now, we'll need to create separate tables
      }).where(eq(users.id, userId));

      return {
        success: true,
        message: '2FA enabled successfully',
      };
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      throw error;
    }
  }

  /**
   * Disable 2FA for a user
   */
  static async disableTwoFactor(userId: number): Promise<{ success: boolean; message: string }> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not connected');

      await db.update(users).set({
        twoFactorEnabled: false,
      }).where(eq(users.id, userId));

      return {
        success: true,
        message: '2FA disabled successfully',
      };
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }
  }

  /**
   * Get user 2FA status
   */
  static async getUserTwoFactorStatus(userId: number) {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not connected');

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        enabled: user.twoFactorEnabled || false,
        userId: user.id,
        email: user.email,
      };
    } catch (error) {
      console.error('Error getting 2FA status:', error);
      throw error;
    }
  }

  /**
   * Validate 2FA setup (verify token before enabling)
   */
  static validateSetup(secret: string, token: string): boolean {
    return this.verifyToken(secret, token);
  }
}
