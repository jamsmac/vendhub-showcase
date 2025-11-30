import { router, adminProcedure } from '../_core/trpc';
import { PerformanceMetricsService } from '../services/performanceMetricsService';
import { z } from 'zod';

export const performanceAnalyticsRouter = router({
	/**
	 * Get metrics for a specific time range
	 * Admin only
	 */
	getMetricsRange: adminProcedure
		.input(
			z.object({
				startDate: z.date(),
				endDate: z.date(),
				limit: z.number().int().positive().max(10000).default(1000),
			})
		)
		.query(async ({ input }) => {
			const metrics = await PerformanceMetricsService.getMetricsRange(
				input.startDate,
				input.endDate,
				input.limit
			);

			return metrics.map((m) => ({
				timestamp: m.timestamp.toISOString(),
				memory: {
					percent: m.memoryUsagePercent,
					used: m.memoryUsedMB,
					total: m.memoryTotalMB,
				},
				cpu: {
					percent: m.cpuUsagePercent,
					cores: m.cpuCores,
					loadAverage: m.cpuLoadAverage,
				},
				disk: {
					percent: m.diskUsagePercent,
					used: m.diskUsedGB,
					total: m.diskTotalGB,
				},
				processes: {
					count: m.processCount,
					stale: m.staleProcessCount,
				},
				health: m.healthStatus,
				issues: m.issues,
				uptime: m.uptime,
			}));
		}),

	/**
	 * Get hourly aggregated metrics
	 * Admin only
	 */
	getHourlyMetrics: adminProcedure
		.input(
			z.object({
				days: z.number().int().positive().max(365).default(7),
			})
		)
		.query(async ({ input }) => {
			const metrics = await PerformanceMetricsService.getHourlyMetrics(input.days);

			return metrics.map((m) => ({
				hour: m.hour,
				memory: {
					avg: parseFloat(m.memoryUsageAvgPercent),
					max: parseFloat(m.memoryUsageMaxPercent),
					min: parseFloat(m.memoryUsageMinPercent),
				},
				cpu: {
					avg: parseFloat(m.cpuUsageAvgPercent),
					max: parseFloat(m.cpuUsageMaxPercent),
					min: parseFloat(m.cpuUsageMinPercent),
				},
				disk: {
					avg: parseFloat(m.diskUsageAvgPercent),
					max: parseFloat(m.diskUsageMaxPercent),
				},
				staleProcesses: parseFloat(m.staleProcessCountAvg),
				events: {
					critical: m.criticalEventsCount,
					warning: m.warningEventsCount,
				},
				recordCount: m.recordCount,
			}));
		}),

	/**
	 * Get daily aggregated metrics
	 * Admin only
	 */
	getDailyMetrics: adminProcedure
		.input(
			z.object({
				days: z.number().int().positive().max(365).default(30),
			})
		)
		.query(async ({ input }) => {
			const metrics = await PerformanceMetricsService.getDailyMetrics(input.days);

			return metrics.map((m) => ({
				date: m.date,
				memory: {
					avg: parseFloat(m.memoryUsageAvgPercent),
					max: parseFloat(m.memoryUsageMaxPercent),
				},
				cpu: {
					avg: parseFloat(m.cpuUsageAvgPercent),
					max: parseFloat(m.cpuUsageMaxPercent),
				},
				disk: {
					avg: parseFloat(m.diskUsageAvgPercent),
					max: parseFloat(m.diskUsageMaxPercent),
				},
				staleProcesses: parseFloat(m.staleProcessCountAvg),
				events: {
					critical: m.criticalEventsCount,
					warning: m.warningEventsCount,
				},
				recordCount: m.recordCount,
			}));
		}),

	/**
	 * Get performance statistics for a date range
	 * Admin only
	 */
	getStatistics: adminProcedure
		.input(
			z.object({
				startDate: z.date(),
				endDate: z.date(),
			})
		)
		.query(async ({ input }) => {
			const stats = await PerformanceMetricsService.getStatistics(
				input.startDate,
				input.endDate
			);

			if (!stats) {
				return null;
			}

			return {
				period: {
					start: stats.period.start.toISOString(),
					end: stats.period.end.toISOString(),
					dataPoints: stats.period.dataPoints,
				},
				memory: {
					avg: stats.memory.avg,
					max: stats.memory.max,
					min: stats.memory.min,
				},
				cpu: {
					avg: stats.cpu.avg,
					max: stats.cpu.max,
					min: stats.cpu.min,
				},
				disk: {
					avg: stats.disk.avg,
					max: stats.disk.max,
					min: stats.disk.min,
				},
			};
		}),

	/**
	 * Get last 24 hours of metrics for quick dashboard view
	 * Admin only
	 */
	getLast24Hours: adminProcedure.query(async () => {
		const endDate = new Date();
		const startDate = new Date();
		startDate.setHours(startDate.getHours() - 24);

		const metrics = await PerformanceMetricsService.getMetricsRange(startDate, endDate, 1440);

		return {
			dataPoints: metrics.length,
			metrics: metrics.map((m) => ({
				timestamp: m.timestamp.toISOString(),
				memory: m.memoryUsagePercent,
				cpu: m.cpuUsagePercent,
				disk: m.diskUsagePercent,
				health: m.healthStatus,
			})),
		};
	}),

	/**
	 * Get performance trends (last 7 days hourly aggregates)
	 * Admin only
	 */
	getTrends: adminProcedure.query(async () => {
		const hourlyMetrics = await PerformanceMetricsService.getHourlyMetrics(7);

		return {
			period: 'last_7_days',
			dataPoints: hourlyMetrics.length,
			trends: hourlyMetrics.map((m) => ({
				hour: m.hour,
				memory: {
					avg: parseFloat(m.memoryUsageAvgPercent),
					max: parseFloat(m.memoryUsageMaxPercent),
				},
				cpu: {
					avg: parseFloat(m.cpuUsageAvgPercent),
					max: parseFloat(m.cpuUsageMaxPercent),
				},
				disk: {
					avg: parseFloat(m.diskUsageAvgPercent),
					max: parseFloat(m.diskUsageMaxPercent),
				},
			})),
		};
	}),

	/**
	 * Get performance summary for a specific date
	 * Admin only
	 */
	getDaySummary: adminProcedure
		.input(
			z.object({
				date: z.date(),
			})
		)
		.query(async ({ input }) => {
			const dateStr = input.date.toISOString().split('T')[0];
			const startDate = new Date(`${dateStr}T00:00:00Z`);
			const endDate = new Date(`${dateStr}T23:59:59Z`);

			const stats = await PerformanceMetricsService.getStatistics(startDate, endDate);

			return {
				date: dateStr,
				summary: stats,
			};
		}),

	/**
	 * Get comparison between two periods
	 * Admin only
	 */
	comparePeriods: adminProcedure
		.input(
			z.object({
				period1Start: z.date(),
				period1End: z.date(),
				period2Start: z.date(),
				period2End: z.date(),
			})
		)
		.query(async ({ input }) => {
			const stats1 = await PerformanceMetricsService.getStatistics(
				input.period1Start,
				input.period1End
			);
			const stats2 = await PerformanceMetricsService.getStatistics(
				input.period2Start,
				input.period2End
			);

			if (!stats1 || !stats2) {
				return null;
			}

			const calculateChange = (old: number, newVal: number) => {
				const change = newVal - old;
				const percentChange = (change / old) * 100;
				return {
					value: Math.round(change * 100) / 100,
					percent: Math.round(percentChange * 100) / 100,
					trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
				};
			};

			return {
				period1: {
					start: stats1.period.start.toISOString(),
					end: stats1.period.end.toISOString(),
				},
				period2: {
					start: stats2.period.start.toISOString(),
					end: stats2.period.end.toISOString(),
				},
				memory: {
					avgChange: calculateChange(stats1.memory.avg, stats2.memory.avg),
					maxChange: calculateChange(stats1.memory.max, stats2.memory.max),
				},
				cpu: {
					avgChange: calculateChange(stats1.cpu.avg, stats2.cpu.avg),
					maxChange: calculateChange(stats1.cpu.max, stats2.cpu.max),
				},
				disk: {
					avgChange: calculateChange(stats1.disk.avg, stats2.disk.avg),
					maxChange: calculateChange(stats1.disk.max, stats2.disk.max),
				},
			};
		}),
});
