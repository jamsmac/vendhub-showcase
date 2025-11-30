import { router, adminProcedure } from '../_core/trpc';
import { SystemHealthService } from '../services/systemHealthService';
import { z } from 'zod';

export const systemHealthRouter = router({
	/**
	 * Get current system health status
	 * Admin only
	 */
	getHealth: adminProcedure.query(async () => {
		const health = SystemHealthService.getSystemHealth();

		return {
			timestamp: health.timestamp,
			uptime: SystemHealthService.formatUptime(health.uptime),
			memory: {
				total: SystemHealthService.formatBytes(health.memory.total),
				used: SystemHealthService.formatBytes(health.memory.used),
				free: SystemHealthService.formatBytes(health.memory.free),
				percentage: health.memory.percentage,
			},
			cpu: {
				cores: health.cpu.cores,
				usage: health.cpu.usage,
				loadAverage: health.cpu.loadAverage.map((val) => Math.round(val * 100) / 100),
			},
			disk: {
				total: SystemHealthService.formatBytes(health.disk.total),
				used: SystemHealthService.formatBytes(health.disk.used),
				free: SystemHealthService.formatBytes(health.disk.free),
				percentage: health.disk.percentage,
			},
			staleProcesses: health.staleProcesses.map((proc) => ({
				pid: proc.pid,
				name: proc.name,
				memory: SystemHealthService.formatBytes(proc.memory),
				cpu: proc.cpu,
			})),
			health: health.health,
			issues: health.issues,
		};
	}),

	/**
	 * Get detailed process list
	 * Admin only
	 */
	getProcesses: adminProcedure.query(async () => {
		const processes = SystemHealthService.getProcessList();

		return processes.slice(0, 20).map((proc) => ({
			pid: proc.pid,
			name: proc.name,
			memory: SystemHealthService.formatBytes(proc.memory),
			cpu: proc.cpu,
		}));
	}),

	/**
	 * Get list of stale processes
	 * Admin only
	 */
	getStaleProcesses: adminProcedure.query(async () => {
		const staleProcesses = SystemHealthService.getStaleProcesses();

		return staleProcesses.map((proc) => ({
			pid: proc.pid,
			name: proc.name,
			memory: SystemHealthService.formatBytes(proc.memory),
			cpu: proc.cpu,
		}));
	}),

	/**
	 * Kill a specific stale process
	 * Admin only
	 */
	killProcess: adminProcedure
		.input(
			z.object({
				pid: z.number().int().positive(),
			})
		)
		.mutation(async ({ input }) => {
			const success = SystemHealthService.killStaleProcess(input.pid);

			return {
				success,
				pid: input.pid,
				message: success ? `Process ${input.pid} terminated` : `Failed to terminate process ${input.pid}`,
			};
		}),

	/**
	 * Kill all stale processes
	 * Admin only
	 */
	killAllStaleProcesses: adminProcedure.mutation(async () => {
		const result = SystemHealthService.killAllStaleProcesses();

		return {
			killed: result.killed,
			failed: result.failed,
			total: result.killed + result.failed,
			message: `Killed ${result.killed} process(es), ${result.failed} failed`,
		};
	}),

	/**
	 * Get health check endpoint for Docker/Kubernetes
	 * Public endpoint - no authentication required
	 */
	healthCheck: router({
		get: router({
			query: async () => {
				const health = SystemHealthService.getSystemHealth();

				return {
					status: health.health === 'healthy' ? 'ok' : health.health === 'warning' ? 'degraded' : 'unhealthy',
					timestamp: health.timestamp,
					uptime: health.uptime,
					memory: health.memory.percentage,
					cpu: health.cpu.usage,
					disk: health.disk.percentage,
					issues: health.issues,
				};
			},
		}),
	}),

	/**
	 * Get system metrics for dashboard
	 * Admin only
	 */
	getMetrics: adminProcedure.query(async () => {
		const health = SystemHealthService.getSystemHealth();

		return {
			timestamp: health.timestamp,
			metrics: [
				{
					name: 'Memory Usage',
					value: health.memory.percentage,
					unit: '%',
					status: health.memory.percentage > 90 ? 'critical' : health.memory.percentage > 75 ? 'warning' : 'ok',
					details: `${SystemHealthService.formatBytes(health.memory.used)} / ${SystemHealthService.formatBytes(health.memory.total)}`,
				},
				{
					name: 'CPU Usage',
					value: health.cpu.usage,
					unit: '%',
					status: health.cpu.usage > 90 ? 'critical' : health.cpu.usage > 75 ? 'warning' : 'ok',
					details: `${health.cpu.cores} cores, Load: ${health.cpu.loadAverage[0].toFixed(2)}`,
				},
				{
					name: 'Disk Usage',
					value: health.disk.percentage,
					unit: '%',
					status: health.disk.percentage > 90 ? 'critical' : health.disk.percentage > 75 ? 'warning' : 'ok',
					details: `${SystemHealthService.formatBytes(health.disk.used)} / ${SystemHealthService.formatBytes(health.disk.total)}`,
				},
				{
					name: 'Stale Processes',
					value: health.staleProcesses.length,
					unit: 'processes',
					status: health.staleProcesses.length > 0 ? 'warning' : 'ok',
					details: health.staleProcesses.length > 0 ? `${health.staleProcesses.length} stale process(es) detected` : 'None',
				},
			],
			uptime: SystemHealthService.formatUptime(health.uptime),
			health: health.health,
			issues: health.issues,
		};
	}),
});
