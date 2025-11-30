import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";
import { NotificationService } from "../services/notificationService";

export const notificationsRouter = router({
  // Get user notifications
  list: protectedProcedure
    .input(z.object({
      limit: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return await db.getUserNotifications(ctx.user.id, input?.limit);
    }),

  // Get unread count
  unreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const count = await db.getUnreadNotificationCount(ctx.user.id);
      return { count };
    }),

  // Mark as read
  markAsRead: protectedProcedure
    .input(z.object({
      notificationId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await db.markNotificationAsRead(input.notificationId, ctx.user.id);
    }),

  // Mark all as read
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      return await db.markAllNotificationsAsRead(ctx.user.id);
    }),

  // Get notification preferences for current user
  getPreferences: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new Error('User not authenticated');
      }

      const preferences = await NotificationService.getPreferences(ctx.user.id);
      
      if (!preferences) {
        return {
          id: 0,
          userId: ctx.user.id,
          emailAlerts: true,
          telegramAlerts: true,
          emailCritical: true,
          emailWarning: true,
          emailInfo: false,
          telegramCritical: true,
          telegramWarning: true,
          telegramInfo: false,
          quietHoursStart: null,
          quietHoursEnd: null,
          timezone: 'UTC',
        };
      }

      return preferences;
    }),

  // Update notification preferences for current user
  updatePreferences: protectedProcedure
    .input(z.object({
      emailAlerts: z.boolean().optional(),
      telegramAlerts: z.boolean().optional(),
      emailCritical: z.boolean().optional(),
      emailWarning: z.boolean().optional(),
      emailInfo: z.boolean().optional(),
      telegramCritical: z.boolean().optional(),
      telegramWarning: z.boolean().optional(),
      telegramInfo: z.boolean().optional(),
      quietHoursStart: z.string().optional().nullable(),
      quietHoursEnd: z.string().optional().nullable(),
      timezone: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User not authenticated');
      }

      try {
        const updated = await NotificationService.updatePreferences(ctx.user.id, input);
        
        if (!updated) {
          throw new Error('Failed to update preferences');
        }

        return {
          success: true,
          preferences: updated,
        };
      } catch (error) {
        console.error('Error updating preferences:', error);
        throw new Error('Failed to update notification preferences');
      }
    }),

  // Send test notification to user
  sendTest: protectedProcedure
    .input(z.object({
      channel: z.enum(['email', 'telegram']),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('User not authenticated');
      }

      try {
        const results = await NotificationService.sendAlert({
          userId: ctx.user.id,
          alertId: 0,
          severity: 'info',
          title: 'Test Notification',
          message: `This is a test notification via ${input.channel}. If you received this, your notification settings are working correctly!`,
        });

        const channelResult = results.find(r => r.channel === input.channel);
        
        if (!channelResult) {
          return {
            success: false,
            error: `${input.channel} channel not enabled or configured`,
          };
        }

        return {
          success: channelResult.success,
          error: channelResult.error,
        };
      } catch (error) {
        console.error('Error sending test notification:', error);
        throw new Error('Failed to send test notification');
      }
    }),

  // Get notification statistics for current user
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new Error('User not authenticated');
      }

      try {
        const log = await NotificationService.getNotificationLog(ctx.user.id, 1000);
        
        const stats = {
          total: log.length,
          sent: log.filter(l => l.status === 'sent').length,
          failed: log.filter(l => l.status === 'failed').length,
          skipped: log.filter(l => l.status === 'skipped').length,
          byChannel: {
            email: log.filter(l => l.channel === 'email').length,
            telegram: log.filter(l => l.channel === 'telegram').length,
            'in-app': log.filter(l => l.channel === 'in-app').length,
          },
          lastNotification: log[log.length - 1]?.sentAt || null,
        };

        return stats;
      } catch (error) {
        console.error('Error fetching stats:', error);
        throw new Error('Failed to fetch notification statistics');
      }
    }),
});
