#!/usr/bin/env node

/**
 * Real-time process monitor that detects and kills stale database processes
 * Runs in the background and periodically checks for orphaned processes
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const STALE_PROCESS_PATTERNS = [
	'db:push',
	'db:pull',
	'drizzle-kit',
	'drizzle-migrate',
	'pnpm db',
	'tsx.*db',
	'tsx.*migrate',
];

const CHECK_INTERVAL = 30000; // Check every 30 seconds
const MAX_PROCESS_AGE = 300000; // Kill processes older than 5 minutes
const MONITOR_LOG = path.join(process.cwd(), '.process-monitor.log');
const PROCESS_TRACKING_FILE = path.join(process.cwd(), '.tracked-processes.json');

class ProcessMonitor {
	constructor() {
		this.trackedProcesses = this.loadTrackedProcesses();
		this.isRunning = false;
	}

	loadTrackedProcesses() {
		try {
			if (fs.existsSync(PROCESS_TRACKING_FILE)) {
				const data = fs.readFileSync(PROCESS_TRACKING_FILE, 'utf-8');
				return JSON.parse(data);
			}
		} catch (e) {
			// Ignore errors
		}
		return {};
	}

	saveTrackedProcesses() {
		try {
			fs.writeFileSync(PROCESS_TRACKING_FILE, JSON.stringify(this.trackedProcesses, null, 2));
		} catch (e) {
			// Ignore errors
		}
	}

	log(message) {
		const timestamp = new Date().toISOString();
		const logMessage = `[${timestamp}] ${message}`;
		console.log(logMessage);

		try {
			fs.appendFileSync(MONITOR_LOG, logMessage + '\n');
		} catch (e) {
			// Ignore log file errors
		}
	}

	getStaleProcesses() {
		try {
			const output = execSync('ps aux', { encoding: 'utf-8' });
			const lines = output.split('\n');
			const staleProcesses = [];

			for (const line of lines) {
				for (const pattern of STALE_PROCESS_PATTERNS) {
					if (line.includes(pattern) && !line.includes('monitor-processes')) {
						const parts = line.split(/\s+/);
						if (parts.length > 1) {
							const pid = parseInt(parts[1]);
							if (!isNaN(pid)) {
								staleProcesses.push({
									pid,
									pattern,
									command: line.substring(line.indexOf(pattern)),
									startTime: new Date(parts[8]).getTime() || Date.now(),
								});
							}
						}
						break;
					}
				}
			}

			return staleProcesses;
		} catch (error) {
			this.log(`Error getting process list: ${error.message}`);
			return [];
		}
	}

	shouldKillProcess(proc) {
		const age = Date.now() - proc.startTime;

		// Kill if older than MAX_PROCESS_AGE
		if (age > MAX_PROCESS_AGE) {
			return true;
		}

		// Kill if it's a drizzle-kit or db:push that's been running for more than 2 minutes
		if ((proc.pattern.includes('drizzle') || proc.pattern.includes('db:push')) && age > 120000) {
			return true;
		}

		return false;
	}

	killProcess(pid) {
		try {
			process.kill(pid, 'SIGTERM');
			this.log(`Killed stale process ${pid}`);
			return true;
		} catch (error) {
			if (error.code !== 'ESRCH') {
				this.log(`Error killing process ${pid}: ${error.message}`);
			}
			return false;
		}
	}

	checkAndCleanup() {
		const staleProcesses = this.getStaleProcesses();

		if (staleProcesses.length === 0) {
			return;
		}

		for (const proc of staleProcesses) {
			const procKey = `${proc.pid}`;

			// Track process first time we see it
			if (!this.trackedProcesses[procKey]) {
				this.trackedProcesses[procKey] = {
					pid: proc.pid,
					pattern: proc.pattern,
					firstSeen: Date.now(),
					command: proc.command.substring(0, 100),
				};
				this.saveTrackedProcesses();
				this.log(`Tracking new stale process: PID ${proc.pid} (${proc.pattern})`);
			}

			// Check if process should be killed
			if (this.shouldKillProcess(proc)) {
				this.log(
					`Killing stale process: PID ${proc.pid} (${proc.pattern}) - Age: ${Math.round((Date.now() - this.trackedProcesses[procKey].firstSeen) / 1000)}s`
				);
				this.killProcess(proc.pid);

				// Remove from tracking
				delete this.trackedProcesses[procKey];
				this.saveTrackedProcesses();
			}
		}

		// Clean up tracking for processes that no longer exist
		const currentPids = new Set(staleProcesses.map((p) => p.pid.toString()));
		for (const pidStr in this.trackedProcesses) {
			if (!currentPids.has(pidStr)) {
				delete this.trackedProcesses[pidStr];
			}
		}
		this.saveTrackedProcesses();
	}

	start() {
		if (this.isRunning) {
			return;
		}

		this.isRunning = true;
		this.log('Process monitor started');

		// Initial check
		this.checkAndCleanup();

		// Set up interval
		this.intervalId = setInterval(() => {
			this.checkAndCleanup();
		}, CHECK_INTERVAL);

		// Handle graceful shutdown
		process.on('SIGINT', () => {
			this.stop();
		});

		process.on('SIGTERM', () => {
			this.stop();
		});
	}

	stop() {
		if (!this.isRunning) {
			return;
		}

		this.isRunning = false;
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}

		this.log('Process monitor stopped');
		process.exit(0);
	}
}

async function main() {
	const monitor = new ProcessMonitor();

	console.log('🔍 Starting process monitor...');
	console.log(`   Checking every ${CHECK_INTERVAL / 1000} seconds`);
	console.log(`   Killing processes older than ${MAX_PROCESS_AGE / 1000} seconds`);
	console.log(`   Log file: ${MONITOR_LOG}\n`);

	monitor.start();

	// Keep process alive
	await new Promise(() => {});
}

main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
