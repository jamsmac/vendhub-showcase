#!/usr/bin/env node

/**
 * Cleanup script to kill stale database migration and build processes
 * This prevents orphaned processes from consuming resources and locking the database
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
	'esbuild.*service',
];

const LOG_FILE = path.join(process.cwd(), '.cleanup-log.txt');

function log(message) {
	const timestamp = new Date().toISOString();
	const logMessage = `[${timestamp}] ${message}`;
	console.log(logMessage);

	try {
		fs.appendFileSync(LOG_FILE, logMessage + '\n');
	} catch (e) {
		// Ignore log file errors
	}
}

function getStaleProcesses() {
	try {
		const output = execSync('ps aux', { encoding: 'utf-8' });
		const lines = output.split('\n');
		const staleProcesses = [];

		for (const line of lines) {
			for (const pattern of STALE_PROCESS_PATTERNS) {
				if (line.includes(pattern) && !line.includes('cleanup-db-processes')) {
					const parts = line.split(/\s+/);
					if (parts.length > 1) {
						const pid = parseInt(parts[1]);
						if (!isNaN(pid)) {
							staleProcesses.push({
								pid,
								pattern,
								command: line.substring(line.indexOf(pattern)),
							});
						}
					}
					break;
				}
			}
		}

		return staleProcesses;
	} catch (error) {
		log(`Error getting process list: ${error.message}`);
		return [];
	}
}

function killProcess(pid, timeout = 5000) {
	try {
		// First try SIGTERM (graceful shutdown)
		process.kill(pid, 'SIGTERM');
		log(`Sent SIGTERM to process ${pid}`);

		// Wait a bit for graceful shutdown
		const startTime = Date.now();
		while (Date.now() - startTime < timeout) {
			try {
				// Check if process still exists
				process.kill(pid, 0);
			} catch (e) {
				// Process no longer exists
				log(`Process ${pid} terminated successfully`);
				return true;
			}
		}

		// If still running, force kill with SIGKILL
		process.kill(pid, 'SIGKILL');
		log(`Sent SIGKILL to process ${pid}`);
		return true;
	} catch (error) {
		if (error.code === 'ESRCH') {
			// Process doesn't exist
			return true;
		}
		log(`Error killing process ${pid}: ${error.message}`);
		return false;
	}
}

function cleanupStaleProcesses() {
	log('Starting cleanup of stale database processes...');

	const staleProcesses = getStaleProcesses();

	if (staleProcesses.length === 0) {
		log('No stale processes found');
		return true;
	}

	log(`Found ${staleProcesses.length} stale process(es):`);

	let allKilled = true;
	for (const proc of staleProcesses) {
		log(`  - PID ${proc.pid}: ${proc.command.substring(0, 80)}`);
		if (!killProcess(proc.pid)) {
			allKilled = false;
		}
	}

	if (allKilled) {
		log(`Successfully killed ${staleProcesses.length} stale process(es)`);
	} else {
		log(`Warning: Some processes could not be killed`);
	}

	return allKilled;
}

function cleanupBuildArtifacts() {
	log('Cleaning up build artifacts...');

	const dirsToClean = [
		'dist',
		'.turbo',
		'node_modules/.cache',
		'.next',
		'build',
		'out',
	];

	for (const dir of dirsToClean) {
		const fullPath = path.join(process.cwd(), dir);
		if (fs.existsSync(fullPath)) {
			try {
				execSync(`rm -rf "${fullPath}"`, { stdio: 'pipe' });
				log(`Cleaned ${dir}`);
			} catch (error) {
				log(`Warning: Could not clean ${dir}: ${error.message}`);
			}
		}
	}
}

function removeStalePortLocks() {
	log('Checking for stale port locks...');

	const ports = [3000, 5173, 5174, 8000, 8080];

	for (const port of ports) {
		try {
			// Try to find process using the port
			const output = execSync(`lsof -i :${port} 2>/dev/null || true`, {
				encoding: 'utf-8',
			});

			if (output.trim()) {
				const lines = output.split('\n');
				for (const line of lines.slice(1)) {
					// Skip header
					const parts = line.split(/\s+/);
					if (parts.length > 1) {
						const pid = parseInt(parts[1]);
						if (!isNaN(pid)) {
							log(`Found process on port ${port}: PID ${pid}`);
							killProcess(pid);
						}
					}
				}
			}
		} catch (error) {
			// Ignore errors - lsof might not be available
		}
	}
}

function main() {
	const args = process.argv.slice(2);
	const verbose = args.includes('--verbose') || args.includes('-v');
	const cleanBuild = args.includes('--clean-build');
	const cleanPorts = args.includes('--clean-ports');

	log('='.repeat(60));
	log('Database Process Cleanup Utility');
	log('='.repeat(60));

	try {
		const success = cleanupStaleProcesses();

		if (cleanBuild) {
			cleanupBuildArtifacts();
		}

		if (cleanPorts) {
			removeStalePortLocks();
		}

		log('='.repeat(60));
		log('Cleanup completed');
		log('='.repeat(60));

		process.exit(success ? 0 : 1);
	} catch (error) {
		log(`Fatal error: ${error.message}`);
		process.exit(1);
	}
}

main();
