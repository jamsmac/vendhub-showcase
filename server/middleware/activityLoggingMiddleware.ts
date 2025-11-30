import { TRPCError } from '@trpc/server';
import { logActivity, extractIpAddress, extractUserAgent, extractReferer, checkRateLimit } from '../services/activityLogger';

/**
 * tRPC middleware to automatically log all API calls
 * Tracks endpoint, method, status, IP address, user agent, and performance metrics
 */
export async function activityLoggingMiddleware(opts: any) {
	const { next, path, type, rawInput, ctx } = opts;
	const startTime = Date.now();

	// Extract request information from context
	const req = ctx.req;
	const ipAddress = extractIpAddress(req);
	const userAgent = extractUserAgent(req);
	const referer = extractReferer(req);

	// Check rate limit
	const rateLimit = await checkRateLimit({
		userId: ctx.user?.id,
		ipAddress,
		endpoint: path,
		limit: 100, // 100 requests per minute per endpoint
	});

	if (!rateLimit.allowed) {
		throw new TRPCError({
			code: 'TOO_MANY_REQUESTS',
			message: 'Rate limit exceeded. Please try again later.',
		});
	}

	// Add rate limit headers to response
	if (ctx.res) {
		ctx.res.setHeader('X-RateLimit-Limit', '100');
		ctx.res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
		ctx.res.setHeader('X-RateLimit-Reset', rateLimit.resetAt.toISOString());
	}

	try {
		// Execute the actual procedure
		const result = await next();

		// Log successful call
		const duration = Date.now() - startTime;
		await logActivity({
			userId: ctx.user?.id,
			action: 'api_call',
			endpoint: path,
			method: 'POST', // tRPC uses POST for all calls
			status: 'success',
			statusCode: 200,
			ipAddress,
			userAgent,
			referer,
			requestBody: sanitizeInput(rawInput),
			duration,
			metadata: {
				type, // 'query' or 'mutation'
				procedure: path,
			},
		});

		return result;
	} catch (error: any) {
		// Log failed call
		const duration = Date.now() - startTime;
		const statusCode = error.code === 'UNAUTHORIZED' ? 401 : error.code === 'FORBIDDEN' ? 403 : 400;
		const status = statusCode === 401 ? 'unauthorized' : statusCode === 403 ? 'forbidden' : 'failure';

		await logActivity({
			userId: ctx.user?.id,
			action: 'api_call',
			endpoint: path,
			method: 'POST',
			status,
			statusCode,
			ipAddress,
			userAgent,
			referer,
			requestBody: sanitizeInput(rawInput),
			duration,
			errorMessage: error.message,
			metadata: {
				type,
				procedure: path,
				errorCode: error.code,
			},
		});

		// Re-throw the error
		throw error;
	}
}

/**
 * Sanitize input to remove sensitive data before logging
 */
function sanitizeInput(input: any): any {
	if (!input) return null;

	const sanitized = JSON.parse(JSON.stringify(input));

	// Remove common sensitive fields
	const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn'];

	function sanitizeObject(obj: any) {
		if (typeof obj !== 'object' || obj === null) return;

		for (const key in obj) {
			if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
				obj[key] = '***';
			} else if (typeof obj[key] === 'object') {
				sanitizeObject(obj[key]);
			}
		}
	}

	sanitizeObject(sanitized);
	return sanitized;
}

/**
 * Middleware to track specific resource access
 */
export async function resourceAccessMiddleware(resource: string, resourceId?: string | number) {
	return async (opts: any) => {
		const { next, ctx } = opts;
		const req = ctx.req;
		const ipAddress = extractIpAddress(req);

		try {
			const result = await next();

			// Log resource access
			await logActivity({
				userId: ctx.user?.id,
				action: 'data_access',
				resource,
				resourceId: typeof resourceId === 'number' ? resourceId : undefined,
				endpoint: opts.path,
				status: 'success',
				statusCode: 200,
				ipAddress,
				userAgent: extractUserAgent(req),
				referer: extractReferer(req),
				metadata: {
					resource,
					resourceId,
				},
			});

			return result;
		} catch (error: any) {
			// Log failed access
			await logActivity({
				userId: ctx.user?.id,
				action: 'data_access',
				resource,
				resourceId: typeof resourceId === 'number' ? resourceId : undefined,
				endpoint: opts.path,
				status: 'failure',
				statusCode: 400,
				ipAddress,
				userAgent: extractUserAgent(req),
				referer: extractReferer(req),
				errorMessage: error.message,
				metadata: {
					resource,
					resourceId,
				},
			});

			throw error;
		}
	};
}

/**
 * Middleware to track sensitive data access
 */
export async function sensitiveDataAccessMiddleware(dataType: string) {
	return async (opts: any) => {
		const { next, ctx } = opts;
		const req = ctx.req;
		const ipAddress = extractIpAddress(req);

		try {
			const result = await next();

			// Log sensitive data access
			await logActivity({
				userId: ctx.user?.id,
				action: 'data_access',
				resource: dataType,
				endpoint: opts.path,
				status: 'success',
				statusCode: 200,
				ipAddress,
				userAgent: extractUserAgent(req),
				referer: extractReferer(req),
				metadata: {
					dataType,
					sensitive: true,
				},
			});

			return result;
		} catch (error: any) {
			throw error;
		}
	};
}
