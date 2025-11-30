import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import {
	logLoginAttempt,
	logActivity,
	extractIpAddress,
	extractUserAgent,
	getActivityLogs,
	getSuspiciousActivities,
} from '../services/activityLogger';
import { requireRole } from '../middleware/rbacMiddleware';

export const activityTrackingRouter = router({
	/**
	 * Log login attempt (called during auth)
	 */
	logLoginAttempt: publicProcedure
		.input(
			z.object({
				email: z.string().email().optional(),
				status: z.enum(['success', 'failed', 'locked']),
				failureReason: z.string().optional(),
				ipAddress: z.string(),
				userAgent: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			await logLoginAttempt({
				email: input.email,
				ipAddress: input.ipAddress,
				userAgent: input.userAgent,
				status: input.status,
				failureReason: input.failureReason,
			});

			return { success: true };
		}),

	/**
	 * Log logout
	 */
	logLogout: protectedProcedure
		.input(
			z.object({
				ipAddress: z.string(),
				userAgent: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			if (!ctx.user) {
				throw new Error('User not authenticated');
			}

			await logActivity({
				userId: ctx.user.id,
				action: 'logout',
				endpoint: '/auth/logout',
				status: 'success',
				statusCode: 200,
				ipAddress: input.ipAddress,
				userAgent: input.userAgent,
				metadata: {
					userId: ctx.user.id,
				},
			});

			return { success: true };
		}),

	/**
	 * Get activity logs (admin only)
	 */
	getActivityLogs: protectedProcedure
		.use(requireRole('admin'))
		.input(
			z.object({
				userId: z.number().int().optional(),
				action: z.string().optional(),
				resource: z.string().optional(),
				status: z.string().optional(),
				ipAddress: z.string().optional(),
				startDate: z.date().optional(),
				endDate: z.date().optional(),
				page: z.number().int().positive().default(1),
				limit: z.number().int().positive().default(50),
			})
		)
		.query(async ({ input }) => {
			const offset = (input.page - 1) * input.limit;

			const logs = await getActivityLogs({
				userId: input.userId,
				action: input.action,
				resource: input.resource,
				status: input.status,
				ipAddress: input.ipAddress,
				startDate: input.startDate,
				endDate: input.endDate,
				limit: input.limit,
				offset,
			});

			return {
				logs,
				page: input.page,
				limit: input.limit,
				total: logs.length,
			};
		}),

	/**
	 * Get suspicious activities (admin only)
	 */
	getSuspiciousActivities: protectedProcedure
		.use(requireRole('admin'))
		.input(
			z.object({
				userId: z.number().int().optional(),
				severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
				reviewed: z.boolean().optional(),
				page: z.number().int().positive().default(1),
				limit: z.number().int().positive().default(20),
			})
		)
		.query(async ({ input }) => {
			const offset = (input.page - 1) * input.limit;

			const activities = await getSuspiciousActivities({
				userId: input.userId,
				severity: input.severity,
				reviewed: input.reviewed,
				limit: input.limit,
				offset,
			});

			return {
				activities,
				page: input.page,
				limit: input.limit,
				total: activities.length,
			};
		}),

	/**
	 * Get user's own activity logs
	 */
	getMyActivityLogs: protectedProcedure
		.input(
			z.object({
				page: z.number().int().positive().default(1),
				limit: z.number().int().positive().default(20),
			})
		)
		.query(async ({ input, ctx }) => {
			if (!ctx.user) {
				throw new Error('User not authenticated');
			}

			const offset = (input.page - 1) * input.limit;

			const logs = await getActivityLogs({
				userId: ctx.user.id,
				limit: input.limit,
				offset,
			});

			return {
				logs,
				page: input.page,
				limit: input.limit,
				total: logs.length,
			};
		}),

	/**
	 * Get login history for current user
	 */
	getMyLoginHistory: protectedProcedure
		.input(
			z.object({
				page: z.number().int().positive().default(1),
				limit: z.number().int().positive().default(10),
			})
		)
		.query(async ({ input, ctx }) => {
			if (!ctx.user) {
				throw new Error('User not authenticated');
			}

			const offset = (input.page - 1) * input.limit;

			const logs = await getActivityLogs({
				userId: ctx.user.id,
				action: 'login',
				limit: input.limit,
				offset,
			});

			return {
				logs,
				page: input.page,
				limit: input.limit,
				total: logs.length,
			};
		}),

	/**
	 * Get active sessions for user
	 */
	getActiveSessions: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.user) {
			throw new Error('User not authenticated');
		}

		// Get recent login activities (last 7 days)
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const logs = await getActivityLogs({
			userId: ctx.user.id,
			action: 'login',
			startDate: sevenDaysAgo,
		});

		// Group by IP address to show unique sessions
		const sessions = new Map<string, any>();

		logs.forEach((log: any) => {
			if (!sessions.has(log.ipAddress)) {
				sessions.set(log.ipAddress, {
					ipAddress: log.ipAddress,
					userAgent: log.userAgent,
					lastActivity: log.createdAt,
					loginCount: 0,
				});
			}

			const session = sessions.get(log.ipAddress);
			session.loginCount += 1;
			if (new Date(log.createdAt) > new Date(session.lastActivity)) {
				session.lastActivity = log.createdAt;
			}
		});

		return Array.from(sessions.values());
	}),

	/**
	 * Export activity logs as CSV (admin only)
	 */
	exportActivityLogs: protectedProcedure
		.use(requireRole('admin'))
		.input(
			z.object({
				userId: z.number().int().optional(),
				action: z.string().optional(),
				startDate: z.date().optional(),
				endDate: z.date().optional(),
			})
		)
		.query(async ({ input }) => {
			const logs = await getActivityLogs({
				userId: input.userId,
				action: input.action,
				startDate: input.startDate,
				endDate: input.endDate,
			});

			// Generate CSV
			const headers = [
				'Date',
				'User ID',
				'Action',
				'Resource',
				'Status',
				'IP Address',
				'Endpoint',
				'Duration (ms)',
			];

			const rows = logs.map((log: any) => [
				new Date(log.createdAt).toLocaleString('ru-RU'),
				log.userId || 'N/A',
				log.action,
				log.resource || 'N/A',
				log.status,
				log.ipAddress,
				log.endpoint,
				log.duration || 'N/A',
			]);

			const csv = [
				headers.join(','),
				...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
			].join('\n');

			return {
				csv,
				filename: `activity-logs-${new Date().toISOString().split('T')[0]}.csv`,
			};
		}),

	/**
	 * Get activity statistics (admin only)
	 */
	getActivityStatistics: protectedProcedure
		.use(requireRole('admin'))
		.input(
			z.object({
				days: z.number().int().positive().default(7),
			})
		)
		.query(async ({ input }) => {
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - input.days);

			const logs = await getActivityLogs({
				startDate,
			});

			// Calculate statistics
			const stats = {
				totalActivities: logs.length,
				byAction: {} as Record<string, number>,
				byStatus: {} as Record<string, number>,
				byResource: {} as Record<string, number>,
				topIPs: {} as Record<string, number>,
				topEndpoints: {} as Record<string, number>,
				avgDuration: 0,
			};

			let totalDuration = 0;
			let durationCount = 0;

			logs.forEach((log: any) => {
				// Count by action
				stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;

				// Count by status
				stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;

				// Count by resource
				if (log.resource) {
					stats.byResource[log.resource] = (stats.byResource[log.resource] || 0) + 1;
				}

				// Count by IP
				stats.topIPs[log.ipAddress] = (stats.topIPs[log.ipAddress] || 0) + 1;

				// Count by endpoint
				stats.topEndpoints[log.endpoint] = (stats.topEndpoints[log.endpoint] || 0) + 1;

				// Calculate average duration
				if (log.duration) {
					totalDuration += log.duration;
					durationCount += 1;
				}
			});

			stats.avgDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

			return stats;
		}),
});
