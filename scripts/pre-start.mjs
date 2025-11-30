#!/usr/bin/env node

/**
 * Pre-start hook that runs before the dev server starts
 * Ensures all stale processes are cleaned up and ports are free
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPreStartCleanup() {
	console.log('\n🚀 Preparing server startup...\n');

	try {
		// Run the cleanup script with all options
		execSync(
			`node "${path.join(__dirname, 'cleanup-db-processes.mjs')}" --clean-build --clean-ports`,
			{
				stdio: 'inherit',
			}
		);

		console.log('\n✅ Server startup preparation completed\n');
		return true;
	} catch (error) {
		console.error('\n⚠️  Pre-start cleanup encountered issues:', error.message, '\n');
		// Don't fail startup, just warn
		return true;
	}
}

async function main() {
	const success = await runPreStartCleanup();
	process.exit(success ? 0 : 1);
}

main();
