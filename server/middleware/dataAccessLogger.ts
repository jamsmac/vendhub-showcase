import { logDataAccess, extractIpAddress, extractUserAgent } from '../services/activityLogger';

/**
 * Log access to sensitive data
 * Use this wrapper around sensitive data access operations
 */
export async function logSensitiveDataAccess(
	userId: number,
	dataType: string,
	action: 'view' | 'create' | 'update' | 'delete' | 'export',
	req: any,
	dataId?: number,
	reason?: string
) {
	const ipAddress = extractIpAddress(req);

	await logDataAccess({
		userId,
		dataType,
		dataId,
		action,
		ipAddress,
		reason,
	});
}

/**
 * Sensitive data types that should be logged
 */
export const SENSITIVE_DATA_TYPES = {
	USER_DATA: 'user_data', // Personal information, emails, phone numbers
	FINANCIAL_DATA: 'financial_data', // Revenue, payments, transactions
	AUDIT_LOGS: 'audit_logs', // System audit logs
	ROLE_ASSIGNMENTS: 'role_assignments', // User role changes
	SYSTEM_CONFIG: 'system_config', // System configuration
	API_KEYS: 'api_keys', // API keys and secrets
	MACHINE_LOCATIONS: 'machine_locations', // Machine locations (sensitive for security)
	INVENTORY_DETAILS: 'inventory_details', // Detailed inventory information
};

/**
 * Create a middleware wrapper for logging data access
 */
export function createDataAccessLogger(dataType: string) {
	return async (opts: any) => {
		const { next, ctx, rawInput } = opts;
		const req = ctx.req;
		const userId = ctx.user?.id;

		if (!userId) {
			// Skip logging for unauthenticated requests
			return next();
		}

		try {
			const result = await next();

			// Determine action based on procedure type
			let action: 'view' | 'create' | 'update' | 'delete' | 'export' = 'view';

			if (opts.path.includes('create')) action = 'create';
			else if (opts.path.includes('update')) action = 'update';
			else if (opts.path.includes('delete')) action = 'delete';
			else if (opts.path.includes('export')) action = 'export';

			// Log the access
			await logSensitiveDataAccess(
				userId,
				dataType,
				action,
				req,
				undefined,
				`Accessed via ${opts.path}`
			);

			return result;
		} catch (error) {
			throw error;
		}
	};
}

/**
 * Middleware for user data access
 */
export const userDataAccessLogger = createDataAccessLogger(SENSITIVE_DATA_TYPES.USER_DATA);

/**
 * Middleware for financial data access
 */
export const financialDataAccessLogger = createDataAccessLogger(
	SENSITIVE_DATA_TYPES.FINANCIAL_DATA
);

/**
 * Middleware for audit log access
 */
export const auditLogAccessLogger = createDataAccessLogger(SENSITIVE_DATA_TYPES.AUDIT_LOGS);

/**
 * Middleware for role assignment access
 */
export const roleAssignmentAccessLogger = createDataAccessLogger(
	SENSITIVE_DATA_TYPES.ROLE_ASSIGNMENTS
);

/**
 * Middleware for system config access
 */
export const systemConfigAccessLogger = createDataAccessLogger(
	SENSITIVE_DATA_TYPES.SYSTEM_CONFIG
);

/**
 * Middleware for API key access
 */
export const apiKeyAccessLogger = createDataAccessLogger(SENSITIVE_DATA_TYPES.API_KEYS);

/**
 * Middleware for machine location access
 */
export const machineLocationAccessLogger = createDataAccessLogger(
	SENSITIVE_DATA_TYPES.MACHINE_LOCATIONS
);

/**
 * Middleware for inventory details access
 */
export const inventoryDetailsAccessLogger = createDataAccessLogger(
	SENSITIVE_DATA_TYPES.INVENTORY_DETAILS
);
