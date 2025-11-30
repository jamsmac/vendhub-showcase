import { getDb } from '../db';
import { backupCodes } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// Simple UUID v4-like generator (no external dependency)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * BackupCodeService - Handles backup code generation, storage, and verification
 * 
 * Features:
 * - Generate backup codes
 * - Store backup codes in database
 * - Retrieve backup codes for user
 * - Verify and consume backup codes
 * - Regenerate backup codes
 */

export class BackupCodeService {
  /**
   * Generate new backup codes (10 codes, 8 characters each)
   */
  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-character alphanumeric code
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
   * Store backup codes in database
   */
  static async storeBackupCodes(
    userId: number,
    codes: string[]
  ): Promise<{ success: boolean; generationId: string; message: string }> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not connected');

      const generationId = generateUUID();

      // Delete old backup codes for this user
      await db.delete(backupCodes).where(eq(backupCodes.userId, userId));

      // Insert new backup codes
      for (const code of codes) {
        await db.insert(backupCodes).values({
          userId,
          code,
          isUsed: false,
          generationId,
        });
      }

      return {
        success: true,
        generationId,
        message: 'Backup codes stored successfully',
      };
    } catch (error) {
      console.error('Error storing backup codes:', error);
      throw error;
    }
  }

  /**
   * Get backup codes for user (only unused codes)
   */
  static async getUserBackupCodes(userId: number) {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not connected');

      const codes = await db.query.backupCodes.findMany({
        where: and(eq(backupCodes.userId, userId), eq(backupCodes.isUsed, false)),
        orderBy: (codes) => codes.createdAt,
      });

      return codes;
    } catch (error) {
      console.error('Error getting backup codes:', error);
      throw error;
    }
  }

  /**
   * Get all backup codes for user (including used ones)
   */
  static async getAllUserBackupCodes(userId: number) {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not connected');

      const codes = await db.query.backupCodes.findMany({
        where: eq(backupCodes.userId, userId),
        orderBy: (codes) => codes.createdAt,
      });

      return codes;
    } catch (error) {
      console.error('Error getting all backup codes:', error);
      throw error;
    }
  }

  /**
   * Verify and consume a backup code
   */
  static async verifyAndConsumeBackupCode(
    userId: number,
    providedCode: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not connected');

      const code = await db.query.backupCodes.findFirst({
        where: and(
          eq(backupCodes.userId, userId),
          eq(backupCodes.code, providedCode.toUpperCase()),
          eq(backupCodes.isUsed, false)
        ),
      });

      if (!code) {
        return {
          success: false,
          message: 'Invalid or already used backup code',
        };
      }

      // Mark code as used
      await db
        .update(backupCodes)
        .set({
          isUsed: true,
          usedAt: new Date().toISOString(),
        })
        .where(eq(backupCodes.id, code.id));

      return {
        success: true,
        message: 'Backup code verified and consumed',
      };
    } catch (error) {
      console.error('Error verifying backup code:', error);
      throw error;
    }
  }

  /**
   * Get backup code statistics for user
   */
  static async getBackupCodeStats(userId: number) {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not connected');

      const allCodes = await db.query.backupCodes.findMany({
        where: eq(backupCodes.userId, userId),
      });

      const usedCodes = allCodes.filter((c) => c.isUsed);
      const unusedCodes = allCodes.filter((c) => !c.isUsed);

      return {
        total: allCodes.length,
        used: usedCodes.length,
        unused: unusedCodes.length,
        lastGenerated: allCodes.length > 0 ? allCodes[0].createdAt : null,
      };
    } catch (error) {
      console.error('Error getting backup code stats:', error);
      throw error;
    }
  }

  /**
   * Regenerate backup codes for user
   */
  static async regenerateBackupCodes(userId: number) {
    try {
      const newCodes = this.generateBackupCodes();
      const result = await this.storeBackupCodes(userId, newCodes);

      return {
        success: result.success,
        codes: newCodes,
        generationId: result.generationId,
        message: 'Backup codes regenerated successfully',
      };
    } catch (error) {
      console.error('Error regenerating backup codes:', error);
      throw error;
    }
  }

  /**
   * Delete all backup codes for user
   */
  static async deleteBackupCodes(userId: number) {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not connected');

      await db.delete(backupCodes).where(eq(backupCodes.userId, userId));

      return {
        success: true,
        message: 'Backup codes deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting backup codes:', error);
      throw error;
    }
  }
}
