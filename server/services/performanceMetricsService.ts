import { getDb } from '../db';
import { performanceMetrics, performanceMetricsHourly, performanceMetricsDaily } from '../../drizzle/schema';
import { SystemHealthService } from './systemHealthService';
import { eq, gte, lte, and } from 'drizzle-orm';
import cron from 'node-cron';

export interface PerformanceSnapshot {
	timestamp: Date;
	memoryUsagePercent: number;
	memoryUsedMB: number;
	memoryTotalMB: number;
	cpuUsagePercent: number;
	cpuCores: number;
	cpuLoadAverage: number;
	diskUsagePercent: number;
	diskUsedGB: number;
	diskTotalGB: number;
	processCount: number;
	staleProcessCount: number;
	healthStatus: 'healthy' | 'warning' | 'critical';
	issues: string[];
	uptime: number;
}

export class PerformanceMetricsService {
	private static isInitialized = false;

	/**
	 * Initialize the performance metrics service
	 * Sets up cron jobs for aggregation
	 */
	static initialize() {
		if (this.isInitialized) {
			return;
		}

		this.isInitialized = true;

		// Collect metrics every minute
		cron.schedule('* * * * *', async () => {
			try {
				await this.collectMetrics();
			} catch (error) {
				console.error('Error collecting performance metrics:', error);
			}
		});

		// Aggregate hourly metrics every hour at minute 0
		cron.schedule('0 * * * *', async () => {
			try {
				await this.aggregateHourlyMetrics();
			} catch (error) {
				console.error('Error aggregating hourly metrics:', error);
			}
		});

		// Aggregate daily metrics every day at midnight
		cron.schedule('0 0 * * *', async () => {
			try {
				await this.aggregateDailyMetrics();
				await this.cleanupOldMetrics();
			} catch (error) {
				console.error('Error aggregating daily metrics:', error);
			}
		});

		console.log('✅ Performance metrics service initialized');
	}

	/**
	 * Collect a single performance snapshot
	 */
	static async collectMetrics(): Promise<void> {
		try {
			const health = SystemHealthService.getSystemHealth();
			const db = getDb();

			const snapshot: PerformanceSnapshot = {
				timestamp: new Date(),
				memoryUsagePercent: health.memory.percentage,
				memoryUsedMB: Math.round(health.memory.used / (1024 * 1024)),
				memoryTotalMB: Math.round(health.memory.total / (1024 * 1024)),
				cpuUsagePercent: health.cpu.usage,
				cpuCores: health.cpu.cores,
				cpuLoadAverage: health.cpu.loadAverage[0],
				diskUsagePercent: health.disk.percentage,
				diskUsedGB: Math.round((health.disk.used / (1024 * 1024 * 1024)) * 100) / 100,
				diskTotalGB: Math.round((health.disk.total / (1024 * 1024 * 1024)) * 100) / 100,
				processCount: health.processes.length,
				staleProcessCount: health.staleProcesses.length,
				healthStatus: health.health,
				issues: health.issues,
				uptime: Math.round(process.uptime()),
			};

			await db.insert(performanceMetrics).values({
				timestamp: snapshot.timestamp.toISOString(),
				memoryUsagePercent: snapshot.memoryUsagePercent.toString(),
				memoryUsedMB: snapshot.memoryUsedMB,
				memoryTotalMB: snapshot.memoryTotalMB,
				cpuUsagePercent: snapshot.cpuUsagePercent.toString(),
				cpuCores: snapshot.cpuCores,
				cpuLoadAverage: snapshot.cpuLoadAverage.toString(),
				diskUsagePercent: snapshot.diskUsagePercent.toString(),
				diskUsedGB: snapshot.diskUsedGB.toString(),
				diskTotalGB: snapshot.diskTotalGB.toString(),
				processCount: snapshot.processCount,
				staleProcessCount: snapshot.staleProcessCount,
				healthStatus: snapshot.healthStatus,
				issues: JSON.stringify(snapshot.issues),
				uptime: snapshot.uptime,
			});
		} catch (error) {
			console.error('Error in collectMetrics:', error);
		}
	}

	/**
	 * Get metrics for a specific time range
	 */
	static async getMetricsRange(
		startDate: Date,
		endDate: Date,
		limit: number = 1000
	): Promise<PerformanceSnapshot[]> {
		try {
			const db = getDb();

			const records = await db
				.select()
				.from(performanceMetrics)
				.where(
					and(
						gte(performanceMetrics.timestamp, startDate.toISOString()),
						lte(performanceMetrics.timestamp, endDate.toISOString())
					)
				)
				.orderBy(performanceMetrics.timestamp)
				.limit(limit);

			return records.map((record) => ({
				timestamp: new Date(record.timestamp),
				memoryUsagePercent: parseFloat(record.memoryUsagePercent),
				memoryUsedMB: record.memoryUsedMB,
				memoryTotalMB: record.memoryTotalMB,
				cpuUsagePercent: parseFloat(record.cpuUsagePercent),
				cpuCores: record.cpuCores,
				cpuLoadAverage: parseFloat(record.cpuLoadAverage),
				diskUsagePercent: parseFloat(record.diskUsagePercent),
				diskUsedGB: parseFloat(record.diskUsedGB),
				diskTotalGB: parseFloat(record.diskTotalGB),
				processCount: record.processCount,
				staleProcessCount: record.staleProcessCount,
				healthStatus: record.healthStatus,
				issues: JSON.parse(record.issues || '[]'),
				uptime: record.uptime,
			}));
		} catch (error) {
			console.error('Error getting metrics range:', error);
			return [];
		}
	}

	/**
	 * Get hourly aggregated metrics
	 */
	static async getHourlyMetrics(days: number = 7): Promise<any[]> {
		try {
			const db = getDb();
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - days);

			const records = await db
				.select()
				.from(performanceMetricsHourly)
				.where(gte(performanceMetricsHourly.hour, startDate.toISOString()))
				.orderBy(performanceMetricsHourly.hour);

			return records;
		} catch (error) {
			console.error('Error getting hourly metrics:', error);
			return [];
		}
	}

	/**
	 * Get daily aggregated metrics
	 */
	static async getDailyMetrics(days: number = 30): Promise<any[]> {
		try {
			const db = getDb();
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - days);
			const startDateStr = startDate.toISOString().split('T')[0];

			const records = await db
				.select()
				.from(performanceMetricsDaily)
				.where(gte(performanceMetricsDaily.date, startDateStr))
				.orderBy(performanceMetricsDaily.date);

			return records;
		} catch (error) {
			console.error('Error getting daily metrics:', error);
			return [];
		}
	}

	/**
	 * Aggregate metrics to hourly summary
	 */
	private static async aggregateHourlyMetrics(): Promise<void> {
		try {
			const db = getDb();

			// Get the last hour's metrics
			const oneHourAgo = new Date();
			oneHourAgo.setHours(oneHourAgo.getHours() - 1);

			const hourlyRecords = await db
				.select()
				.from(performanceMetrics)
				.where(
					and(
						gte(performanceMetrics.timestamp, oneHourAgo.toISOString()),
						lte(performanceMetrics.timestamp, new Date().toISOString())
					)
				);

			if (hourlyRecords.length === 0) {
				return;
			}

			// Calculate averages and maximums
			const memoryUsages = hourlyRecords.map((r) => parseFloat(r.memoryUsagePercent));
			const cpuUsages = hourlyRecords.map((r) => parseFloat(r.cpuUsagePercent));
			const diskUsages = hourlyRecords.map((r) => parseFloat(r.diskUsagePercent));
			const staleProcesses = hourlyRecords.map((r) => r.staleProcessCount);
			const criticalEvents = hourlyRecords.filter((r) => r.healthStatus === 'critical').length;
			const warningEvents = hourlyRecords.filter((r) => r.healthStatus === 'warning').length;

			const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
			const max = (arr: number[]) => Math.max(...arr);
			const min = (arr: number[]) => Math.min(...arr);

			const hour = new Date();
			hour.setMinutes(0, 0, 0);

			await db.insert(performanceMetricsHourly).values({
				hour: hour.toISOString(),
				memoryUsageAvgPercent: avg(memoryUsages).toString(),
				memoryUsageMaxPercent: max(memoryUsages).toString(),
				memoryUsageMinPercent: min(memoryUsages).toString(),
				cpuUsageAvgPercent: avg(cpuUsages).toString(),
				cpuUsageMaxPercent: max(cpuUsages).toString(),
				cpuUsageMinPercent: min(cpuUsages).toString(),
				diskUsageAvgPercent: avg(diskUsages).toString(),
				diskUsageMaxPercent: max(diskUsages).toString(),
				staleProcessCountAvg: avg(staleProcesses).toString(),
				criticalEventsCount: criticalEvents,
				warningEventsCount: warningEvents,
				recordCount: hourlyRecords.length,
			});
		} catch (error) {
			console.error('Error aggregating hourly metrics:', error);
		}
	}

	/**
	 * Aggregate hourly metrics to daily summary
	 */
	private static async aggregateDailyMetrics(): Promise<void> {
		try {
			const db = getDb();

			// Get yesterday's hourly metrics
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			const yesterdayStr = yesterday.toISOString().split('T')[0];

			const dailyRecords = await db
				.select()
				.from(performanceMetricsHourly)
				.where(
					and(
						gte(performanceMetricsHourly.hour, `${yesterdayStr}T00:00:00`),
						lte(performanceMetricsHourly.hour, `${yesterdayStr}T23:59:59`)
					)
				);

			if (dailyRecords.length === 0) {
				return;
			}

			// Calculate daily aggregates
			const memoryAvgs = dailyRecords.map((r) => parseFloat(r.memoryUsageAvgPercent));
			const memoryMaxs = dailyRecords.map((r) => parseFloat(r.memoryUsageMaxPercent));
			const cpuAvgs = dailyRecords.map((r) => parseFloat(r.cpuUsageAvgPercent));
			const cpuMaxs = dailyRecords.map((r) => parseFloat(r.cpuUsageMaxPercent));
			const diskAvgs = dailyRecords.map((r) => parseFloat(r.diskUsageAvgPercent));
			const diskMaxs = dailyRecords.map((r) => parseFloat(r.diskUsageMaxPercent));
			const staleProcesses = dailyRecords.map((r) => parseFloat(r.staleProcessCountAvg));
			const criticalEvents = dailyRecords.reduce((sum, r) => sum + r.criticalEventsCount, 0);
			const warningEvents = dailyRecords.reduce((sum, r) => sum + r.warningEventsCount, 0);

			const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
			const max = (arr: number[]) => Math.max(...arr);

			await db.insert(performanceMetricsDaily).values({
				date: yesterdayStr,
				memoryUsageAvgPercent: avg(memoryAvgs).toString(),
				memoryUsageMaxPercent: max(memoryMaxs).toString(),
				cpuUsageAvgPercent: avg(cpuAvgs).toString(),
				cpuUsageMaxPercent: max(cpuMaxs).toString(),
				diskUsageAvgPercent: avg(diskAvgs).toString(),
				diskUsageMaxPercent: max(diskMaxs).toString(),
				staleProcessCountAvg: avg(staleProcesses).toString(),
				criticalEventsCount: criticalEvents,
				warningEventsCount: warningEvents,
				recordCount: dailyRecords.length,
			});
		} catch (error) {
			console.error('Error aggregating daily metrics:', error);
		}
	}

	/**
	 * Clean up old metrics to prevent database bloat
	 * Keeps raw metrics for 7 days, hourly for 90 days, daily indefinitely
	 */
	private static async cleanupOldMetrics(): Promise<void> {
		try {
			const db = getDb();

			// Delete raw metrics older than 7 days
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

			await db
				.delete(performanceMetrics)
				.where(lte(performanceMetrics.timestamp, sevenDaysAgo.toISOString()));

			// Delete hourly metrics older than 90 days
			const ninetyDaysAgo = new Date();
			ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

			await db
				.delete(performanceMetricsHourly)
				.where(lte(performanceMetricsHourly.hour, ninetyDaysAgo.toISOString()));

			console.log('✅ Old metrics cleaned up');
		} catch (error) {
			console.error('Error cleaning up old metrics:', error);
		}
	}

	/**
	 * Get performance statistics for a date range
	 */
	static async getStatistics(startDate: Date, endDate: Date) {
		try {
			const metrics = await this.getMetricsRange(startDate, endDate, 10000);

			if (metrics.length === 0) {
				return null;
			}

			const memoryUsages = metrics.map((m) => m.memoryUsagePercent);
			const cpuUsages = metrics.map((m) => m.cpuUsagePercent);
			const diskUsages = metrics.map((m) => m.diskUsagePercent);

			const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
			const max = (arr: number[]) => Math.max(...arr);
			const min = (arr: number[]) => Math.min(...arr);

			return {
				period: {
					start: startDate,
					end: endDate,
					dataPoints: metrics.length,
				},
				memory: {
					avg: Math.round(avg(memoryUsages) * 100) / 100,
					max: Math.round(max(memoryUsages) * 100) / 100,
					min: Math.round(min(memoryUsages) * 100) / 100,
				},
				cpu: {
					avg: Math.round(avg(cpuUsages) * 100) / 100,
					max: Math.round(max(cpuUsages) * 100) / 100,
					min: Math.round(min(cpuUsages) * 100) / 100,
				},
				disk: {
					avg: Math.round(avg(diskUsages) * 100) / 100,
					max: Math.round(max(diskUsages) * 100) / 100,
					min: Math.round(min(diskUsages) * 100) / 100,
				},
			};
		} catch (error) {
			console.error('Error getting statistics:', error);
			return null;
		}
	}
}
