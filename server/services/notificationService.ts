/**
 * Notification Service
 * Handles sending notifications via email and Telegram channels
 */

import nodemailer from 'nodemailer';
import axios from 'axios';
import { getDb } from '../db';
import { notificationLog, alertNotifications } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// ============================================================
// Email Configuration
// ============================================================

const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  } : undefined,
});

// ============================================================
// Telegram Configuration
// ============================================================

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// ============================================================
// Types
// ============================================================

export interface NotificationPayload {
  userId: number;
  alertId: number;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  metric?: string;
  value?: number;
  threshold?: number;
}

export interface NotificationResult {
  success: boolean;
  channel: 'email' | 'telegram' | 'in-app';
  notificationId?: number;
  error?: string;
}

// ============================================================
// Notification Service
// ============================================================

export class NotificationService {
  /**
   * Send notification via all enabled channels for user
   */
  static async sendAlert(payload: NotificationPayload): Promise<NotificationResult[]> {
    const db = await getDb();
    if (!db) {
      console.error('❌ Database connection failed');
      return [];
    }

    try {
      // Get user preferences
      const preferences = await db.query.notificationPreferences.findFirst({
        where: (table) => eq(table.userId, payload.userId),
      });

      if (!preferences) {
        console.warn(`⚠️  No notification preferences found for user ${payload.userId}`);
        return [];
      }

      const results: NotificationResult[] = [];

      // Check if should send based on severity and preferences
      const shouldSendEmail = this.shouldSendEmail(payload.severity, preferences);
      const shouldSendTelegram = this.shouldSendTelegram(payload.severity, preferences);

      // Send email
      if (shouldSendEmail) {
        const emailResult = await this.sendEmailNotification(payload, db);
        results.push(emailResult);
      }

      // Send Telegram
      if (shouldSendTelegram) {
        const telegramResult = await this.sendTelegramNotification(payload, db);
        results.push(telegramResult);
      }

      // Log results
      for (const result of results) {
        if (result.notificationId) {
          await db.update(alertNotifications)
            .set({
              status: result.success ? 'sent' : 'failed',
              sentAt: new Date(),
              failureReason: result.error || null,
            })
            .where(eq(alertNotifications.id, result.notificationId));
        }
      }

      return results;
    } catch (error) {
      console.error('❌ Error sending alert:', error);
      return [];
    }
  }

  /**
   * Send email notification
   */
  private static async sendEmailNotification(
    payload: NotificationPayload,
    db: any
  ): Promise<NotificationResult> {
    try {
      // Get user email
      const user = await db.query.users.findFirst({
        where: (table) => eq(table.id, payload.userId),
      });

      if (!user?.email) {
        return {
          success: false,
          channel: 'email',
          error: 'User email not found',
        };
      }

      // Create notification record
      const [notification] = await db.insert(alertNotifications).values({
        alertId: payload.alertId,
        userId: payload.userId,
        channel: 'email',
        status: 'pending',
      });

      const notificationId = notification?.insertId || 0;

      // Build email content
      const emailContent = this.buildEmailContent(payload);

      // Send email
      const info = await emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@vendhub.local',
        to: user.email,
        subject: `[${payload.severity.toUpperCase()}] ${payload.title}`,
        html: emailContent,
      });

      // Log notification
      await db.insert(notificationLog).values({
        userId: payload.userId,
        channel: 'email',
        subject: payload.title,
        message: payload.message,
        recipientEmail: user.email,
        status: 'sent',
        sentAt: new Date(),
      });

      console.log(`✅ Email sent to ${user.email} (Message ID: ${info.messageId})`);

      return {
        success: true,
        channel: 'email',
        notificationId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Email notification failed:', errorMessage);

      // Log failed notification
      const db = await getDb();
      if (db) {
        const user = await db.query.users.findFirst({
          where: (table) => eq(table.id, payload.userId),
        });

        await db.insert(notificationLog).values({
          userId: payload.userId,
          channel: 'email',
          subject: payload.title,
          message: payload.message,
          recipientEmail: user?.email,
          status: 'failed',
          errorMessage,
          sentAt: new Date(),
        });
      }

      return {
        success: false,
        channel: 'email',
        error: errorMessage,
      };
    }
  }

  /**
   * Send Telegram notification
   */
  private static async sendTelegramNotification(
    payload: NotificationPayload,
    db: any
  ): Promise<NotificationResult> {
    try {
      // Get user Telegram ID
      const user = await db.query.users.findFirst({
        where: (table) => eq(table.id, payload.userId),
      });

      if (!user?.telegramId) {
        return {
          success: false,
          channel: 'telegram',
          error: 'User Telegram ID not found',
        };
      }

      // Create notification record
      const [notification] = await db.insert(alertNotifications).values({
        alertId: payload.alertId,
        userId: payload.userId,
        channel: 'telegram',
        status: 'pending',
      });

      const notificationId = notification?.insertId || 0;

      // Build Telegram message
      const telegramMessage = this.buildTelegramMessage(payload);

      // Send Telegram message
      const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
        chat_id: user.telegramId,
        text: telegramMessage,
        parse_mode: 'HTML',
      });

      // Log notification
      await db.insert(notificationLog).values({
        userId: payload.userId,
        channel: 'telegram',
        subject: payload.title,
        message: payload.message,
        recipientTelegramId: user.telegramId,
        status: 'sent',
        sentAt: new Date(),
      });

      console.log(`✅ Telegram message sent to ${user.telegramId}`);

      return {
        success: true,
        channel: 'telegram',
        notificationId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Telegram notification failed:', errorMessage);

      // Log failed notification
      const db = await getDb();
      if (db) {
        const user = await db.query.users.findFirst({
          where: (table) => eq(table.id, payload.userId),
        });

        await db.insert(notificationLog).values({
          userId: payload.userId,
          channel: 'telegram',
          subject: payload.title,
          message: payload.message,
          recipientTelegramId: user?.telegramId,
          status: 'failed',
          errorMessage,
          sentAt: new Date(),
        });
      }

      return {
        success: false,
        channel: 'telegram',
        error: errorMessage,
      };
    }
  }

  /**
   * Check if email should be sent based on severity and preferences
   */
  private static shouldSendEmail(severity: string, preferences: any): boolean {
    if (!preferences.emailAlerts) return false;

    switch (severity) {
      case 'critical':
        return preferences.emailCritical;
      case 'warning':
        return preferences.emailWarning;
      case 'info':
        return preferences.emailInfo;
      default:
        return false;
    }
  }

  /**
   * Check if Telegram should be sent based on severity and preferences
   */
  private static shouldSendTelegram(severity: string, preferences: any): boolean {
    if (!preferences.telegramAlerts) return false;

    switch (severity) {
      case 'critical':
        return preferences.telegramCritical;
      case 'warning':
        return preferences.telegramWarning;
      case 'info':
        return preferences.telegramInfo;
      default:
        return false;
    }
  }

  /**
   * Build HTML email content
   */
  private static buildEmailContent(payload: NotificationPayload): string {
    const severityColor = {
      critical: '#dc2626',
      warning: '#f59e0b',
      info: '#3b82f6',
    }[payload.severity] || '#6b7280';

    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="border-left: 4px solid ${severityColor}; padding: 20px; background-color: #f9fafb; margin-bottom: 20px;">
              <h2 style="margin: 0 0 10px 0; color: ${severityColor};">
                ${payload.severity.toUpperCase()}: ${payload.title}
              </h2>
              <p style="margin: 0; color: #666;">${payload.message}</p>
            </div>

            ${payload.metric ? `
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0; font-weight: bold;">Metric Details</p>
                <p style="margin: 0;"><strong>${payload.metric}:</strong> ${payload.value}</p>
                ${payload.threshold ? `<p style="margin: 5px 0 0 0;"><strong>Threshold:</strong> ${payload.threshold}</p>` : ''}
              </div>
            ` : ''}

            <div style="color: #999; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              <p style="margin: 0;">VendHub Manager Alert System</p>
              <p style="margin: 5px 0 0 0;">${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Build Telegram message
   */
  private static buildTelegramMessage(payload: NotificationPayload): string {
    const severityEmoji = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
    }[payload.severity] || '📢';

    let message = `${severityEmoji} <b>${payload.title}</b>\n\n${payload.message}`;

    if (payload.metric) {
      message += `\n\n<b>Metric:</b> ${payload.metric}`;
      if (payload.value !== undefined) {
        message += `\n<b>Value:</b> ${payload.value}`;
      }
      if (payload.threshold !== undefined) {
        message += `\n<b>Threshold:</b> ${payload.threshold}`;
      }
    }

    return message;
  }

  /**
   * Get notification log for user
   */
  static async getNotificationLog(userId: number, limit: number = 50) {
    const db = await getDb();
    if (!db) return [];

    try {
      return await db.query.notificationLog.findMany({
        where: (table) => eq(table.userId, userId),
        orderBy: (table) => [table.sentAt],
        limit,
      });
    } catch (error) {
      console.error('❌ Error fetching notification log:', error);
      return [];
    }
  }

  /**
   * Get notification preferences for user
   */
  static async getPreferences(userId: number) {
    const db = await getDb();
    if (!db) return null;

    try {
      return await db.query.notificationPreferences.findFirst({
        where: (table) => eq(table.userId, userId),
      });
    } catch (error) {
      console.error('❌ Error fetching preferences:', error);
      return null;
    }
  }

  /**
   * Update notification preferences
   */
  static async updatePreferences(userId: number, preferences: Partial<any>) {
    const db = await getDb();
    if (!db) return null;

    try {
      // Check if preferences exist
      const existing = await this.getPreferences(userId);

      if (existing) {
        // Update existing
        await db.update(notificationPreferences)
          .set({
            ...preferences,
            updatedAt: new Date(),
          })
          .where(eq(notificationPreferences.userId, userId));
      } else {
        // Create new
        await db.insert(notificationPreferences).values({
          userId,
          ...preferences,
        });
      }

      return await this.getPreferences(userId);
    } catch (error) {
      console.error('❌ Error updating preferences:', error);
      return null;
    }
  }
}
