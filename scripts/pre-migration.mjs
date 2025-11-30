#!/usr/bin/env node

/**
 * Pre-migration hook that runs before any database migration
 * Ensures all stale processes are killed and database is in a clean state
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCleanup() {
	console.log('\n🧹 Running pre-migration cleanup...\n');

	try {
		// Run the cleanup script
		execSync(`node "${path.join(__dirname, 'cleanup-db-processes.mjs')}" --clean-build`, {
			stdio: 'inherit',
		});

		console.log('\n✅ Pre-migration cleanup completed successfully\n');
		return true;
	} catch (error) {
		console.error('\n❌ Pre-migration cleanup failed:', error.message, '\n');
		return false;
	}
}

async function main() {
	const success = await runCleanup();
	process.exit(success ? 0 : 1);
}

main();
