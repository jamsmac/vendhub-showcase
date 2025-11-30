import { execSync } from 'child_process';
import os from 'os';

export interface ProcessInfo {
	pid: number;
	name: string;
	memory: number;
	cpu: number;
	age: number;
}

export interface SystemHealth {
	timestamp: Date;
	uptime: number;
	memory: {
		total: number;
		used: number;
		free: number;
		percentage: number;
	};
	cpu: {
		cores: number;
		usage: number;
		loadAverage: number[];
	};
	disk: {
		total: number;
		used: number;
		free: number;
		percentage: number;
	};
	processes: ProcessInfo[];
	staleProcesses: ProcessInfo[];
	health: 'healthy' | 'warning' | 'critical';
	issues: string[];
}

const STALE_PROCESS_PATTERNS = [
	'db:push',
	'db:pull',
	'drizzle-kit',
	'drizzle-migrate',
	'pnpm db',
	'tsx.*db',
	'tsx.*migrate',
	'esbuild.*service',
];

const STALE_PROCESS_AGE_THRESHOLD = 300000; // 5 minutes in milliseconds

export class SystemHealthService {
	static getMemoryUsage(): SystemHealth['memory'] {
		const totalMemory = os.totalmem();
		const freeMemory = os.freemem();
		const usedMemory = totalMemory - freeMemory;

		return {
			total: totalMemory,
			used: usedMemory,
			free: freeMemory,
			percentage: Math.round((usedMemory / totalMemory) * 100),
		};
	}

	static getCpuUsage(): SystemHealth['cpu'] {
		const cpus = os.cpus();
		const loadAverage = os.loadavg();

		// Calculate CPU usage from load average
		const cpuUsage = Math.round((loadAverage[0] / cpus.length) * 100);

		return {
			cores: cpus.length,
			usage: Math.min(cpuUsage, 100),
			loadAverage,
		};
	}

	static getDiskUsage(): SystemHealth['disk'] {
		try {
			// Use df command to get disk usage
			const output = execSync('df -B1 / | tail -1', { encoding: 'utf-8' });
			const parts = output.split(/\s+/);

			if (parts.length >= 4) {
				const total = parseInt(parts[1], 10);
				const used = parseInt(parts[2], 10);
				const free = parseInt(parts[3], 10);

				return {
					total,
					used,
					free,
					percentage: Math.round((used / total) * 100),
				};
			}
		} catch (error) {
			// Fallback if df command fails
		}

		return {
			total: 0,
			used: 0,
			free: 0,
			percentage: 0,
		};
	}

	static getProcessList(): ProcessInfo[] {
		try {
			const output = execSync('ps aux', { encoding: 'utf-8' });
			const lines = output.split('\n');
			const processes: ProcessInfo[] = [];

			for (const line of lines.slice(1)) {
				const parts = line.split(/\s+/);
				if (parts.length > 10) {
					const pid = parseInt(parts[1], 10);
					const memory = parseInt(parts[5], 10) * 1024; // Convert to bytes
					const cpu = parseFloat(parts[2]);
					const cmd = parts.slice(10).join(' ');

					if (!isNaN(pid)) {
						processes.push({
							pid,
							name: cmd.substring(0, 100),
							memory,
							cpu,
							age: 0, // Age would need to be calculated from start time
						});
					}
				}
			}

			return processes;
		} catch (error) {
			return [];
		}
	}

	static getStaleProcesses(): ProcessInfo[] {
		try {
			const output = execSync('ps aux', { encoding: 'utf-8' });
			const lines = output.split('\n');
			const staleProcesses: ProcessInfo[] = [];

			for (const line of lines) {
				for (const pattern of STALE_PROCESS_PATTERNS) {
					if (line.includes(pattern) && !line.includes('systemHealthService')) {
						const parts = line.split(/\s+/);
						if (parts.length > 10) {
							const pid = parseInt(parts[1], 10);
							const memory = parseInt(parts[5], 10) * 1024;
							const cpu = parseFloat(parts[2]);
							const cmd = parts.slice(10).join(' ');

							if (!isNaN(pid)) {
								staleProcesses.push({
									pid,
									name: cmd.substring(0, 100),
									memory,
									cpu,
									age: STALE_PROCESS_AGE_THRESHOLD, // Mark as stale
								});
							}
						}
						break;
					}
				}
			}

			return staleProcesses;
		} catch (error) {
			return [];
		}
	}

	static getSystemHealth(): SystemHealth {
		const memory = this.getMemoryUsage();
		const cpu = this.getCpuUsage();
		const disk = this.getDiskUsage();
		const staleProcesses = this.getStaleProcesses();
		const processes = this.getProcessList();

		const issues: string[] = [];

		// Check for issues
		if (memory.percentage > 90) {
			issues.push('Memory usage critically high (>90%)');
		} else if (memory.percentage > 75) {
			issues.push('Memory usage high (>75%)');
		}

		if (cpu.usage > 90) {
			issues.push('CPU usage critically high (>90%)');
		} else if (cpu.usage > 75) {
			issues.push('CPU usage high (>75%)');
		}

		if (disk.percentage > 90) {
			issues.push('Disk usage critically high (>90%)');
		} else if (disk.percentage > 75) {
			issues.push('Disk usage high (>75%)');
		}

		if (staleProcesses.length > 0) {
			issues.push(`${staleProcesses.length} stale process(es) detected`);
		}

		// Determine health status
		let health: 'healthy' | 'warning' | 'critical' = 'healthy';
		if (issues.length > 0) {
			health = memory.percentage > 90 || cpu.usage > 90 || disk.percentage > 90 ? 'critical' : 'warning';
		}

		return {
			timestamp: new Date(),
			uptime: process.uptime(),
			memory,
			cpu,
			disk,
			processes: processes.slice(0, 10), // Top 10 processes
			staleProcesses,
			health,
			issues,
		};
	}

	static killStaleProcess(pid: number): boolean {
		try {
			process.kill(pid, 'SIGTERM');
			return true;
		} catch (error) {
			return false;
		}
	}

	static killAllStaleProcesses(): { killed: number; failed: number } {
		const staleProcesses = this.getStaleProcesses();
		let killed = 0;
		let failed = 0;

		for (const proc of staleProcesses) {
			if (this.killStaleProcess(proc.pid)) {
				killed++;
			} else {
				failed++;
			}
		}

		return { killed, failed };
	}

	static formatBytes(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
	}

	static formatUptime(seconds: number): string {
		const days = Math.floor(seconds / 86400);
		const hours = Math.floor((seconds % 86400) / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);

		const parts = [];
		if (days > 0) parts.push(`${days}d`);
		if (hours > 0) parts.push(`${hours}h`);
		if (minutes > 0) parts.push(`${minutes}m`);

		return parts.length > 0 ? parts.join(' ') : 'Just started';
	}
}
