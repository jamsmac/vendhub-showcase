import { getDb } from '../db';
import {
	activityLogs,
	loginAttempts,
	suspiciousActivities,
	apiRateLimits,
	dataAccessLogs,
} from '../../drizzle/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

/**
 * Extract IP address from request headers
 * Handles proxies and load balancers (X-Forwarded-For, CF-Connecting-IP, etc.)
 */
export function extractIpAddress(req: any): string {
	// Check for IP from a proxy
	if (req.headers['x-forwarded-for']) {
		return (req.headers['x-forwarded-for'] as string).split(',')[0].trim();
	}

	if (req.headers['cf-connecting-ip']) {
		return req.headers['cf-connecting-ip'] as string;
	}

	if (req.headers['x-real-ip']) {
		return req.headers['x-real-ip'] as string;
	}

	// Fallback to direct connection IP
	return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
}

/**
 * Extract user agent from request
 */
export function extractUserAgent(req: any): string {
	return (req.headers['user-agent'] || 'unknown').substring(0, 500);
}

/**
 * Extract referer from request
 */
export function extractReferer(req: any): string | null {
	const referer = req.headers['referer'];
	return referer ? referer.substring(0, 255) : null;
}

/**
 * Log an activity/API call
 */
export async function logActivity(data: {
	userId?: number;
	action: string;
	resource?: string;
	resourceId?: number;
	method?: string;
	endpoint: string;
	status: 'success' | 'failure' | 'unauthorized' | 'forbidden';
	statusCode: number;
	ipAddress: string;
	userAgent: string;
	referer?: string | null;
	requestBody?: any;
	responseSize?: number;
	duration?: number;
	errorMessage?: string;
	metadata?: any;
}) {
	const db = await getDb();
	if (!db) {
		console.warn('Database not connected, skipping activity log');
		return;
	}

	try {
		// Sanitize request body (remove passwords and sensitive data)
		let sanitizedBody = null;
		if (data.requestBody) {
			sanitizedBody = JSON.stringify(data.requestBody);
			// Remove common sensitive fields
			sanitizedBody = sanitizedBody.replace(/"password":"[^"]*"/g, '"password":"***"');
			sanitizedBody = sanitizedBody.replace(/"token":"[^"]*"/g, '"token":"***"');
			sanitizedBody = sanitizedBody.replace(/"secret":"[^"]*"/g, '"secret":"***"');
		}

		await db.insert(activityLogs).values({
			userId: data.userId,
			action: data.action,
			resource: data.resource,
			resourceId: data.resourceId,
			method: data.method,
			endpoint: data.endpoint,
			status: data.status,
			statusCode: data.statusCode,
			ipAddress: data.ipAddress,
			userAgent: data.userAgent,
			referer: data.referer,
			requestBody: sanitizedBody,
			responseSize: data.responseSize,
			duration: data.duration,
			errorMessage: data.errorMessage,
			metadata: data.metadata ? JSON.stringify(data.metadata) : null,
			createdAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Failed to log activity:', error);
	}
}

/**
 * Log a login attempt
 */
export async function logLoginAttempt(data: {
	userId?: number;
	email?: string;
	ipAddress: string;
	userAgent: string;
	status: 'success' | 'failed' | 'locked';
	failureReason?: string;
}) {
	const db = await getDb();
	if (!db) {
		console.warn('Database not connected, skipping login attempt log');
		return;
	}

	try {
		// Get current attempt count for this IP in the last hour
		const oneHourAgo = new Date();
		oneHourAgo.setHours(oneHourAgo.getHours() - 1);

		const recentAttempts = await db
			.select({ count: loginAttempts.id })
			.from(loginAttempts)
			.where(
				and(
					eq(loginAttempts.ipAddress, data.ipAddress),
					eq(loginAttempts.status, 'failed'),
					gte(loginAttempts.createdAt, oneHourAgo.toISOString())
				)
			);

		const attemptCount = recentAttempts.length;
		const isLocked = attemptCount >= 5; // Lock after 5 failed attempts

		let lockoutUntil = null;
		if (isLocked && data.status === 'failed') {
			lockoutUntil = new Date();
			lockoutUntil.setMinutes(lockoutUntil.getMinutes() + 15); // 15-minute lockout
		}

		await db.insert(loginAttempts).values({
			userId: data.userId,
			email: data.email,
			ipAddress: data.ipAddress,
			userAgent: data.userAgent,
			status: isLocked ? 'locked' : data.status,
			failureReason: data.failureReason,
			attemptNumber: attemptCount + 1,
			lockoutUntil: lockoutUntil?.toISOString(),
			createdAt: new Date().toISOString(),
		});

		// Flag suspicious activity if too many failed attempts
		if (attemptCount >= 3) {
			await flagSuspiciousActivity({
				userId: data.userId,
				activityType: 'multiple_failed_logins',
				severity: attemptCount >= 5 ? 'high' : 'medium',
				description: `${attemptCount + 1} failed login attempts from IP ${data.ipAddress}`,
				ipAddress: data.ipAddress,
			});
		}
	} catch (error) {
		console.error('Failed to log login attempt:', error);
	}
}

/**
 * Flag a suspicious activity
 */
export async function flagSuspiciousActivity(data: {
	activityLogId?: number;
	userId?: number;
	activityType: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
	description: string;
	ipAddress?: string;
}) {
	const db = await getDb();
	if (!db) {
		console.warn('Database not connected, skipping suspicious activity log');
		return;
	}

	try {
		await db.insert(suspiciousActivities).values({
			activityLogId: data.activityLogId,
			userId: data.userId,
			activityType: data.activityType as any,
			severity: data.severity,
			description: data.description,
			ipAddress: data.ipAddress,
			reviewed: false,
			createdAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Failed to flag suspicious activity:', error);
	}
}

/**
 * Log data access
 */
export async function logDataAccess(data: {
	userId: number;
	dataType: string;
	dataId?: number;
	action: 'view' | 'create' | 'update' | 'delete' | 'export';
	ipAddress: string;
	reason?: string;
}) {
	const db = await getDb();
	if (!db) {
		console.warn('Database not connected, skipping data access log');
		return;
	}

	try {
		await db.insert(dataAccessLogs).values({
			userId: data.userId,
			dataType: data.dataType,
			dataId: data.dataId,
			action: data.action,
			ipAddress: data.ipAddress,
			reason: data.reason,
			approved: true,
			createdAt: new Date().toISOString(),
		});

		// Flag if accessing sensitive data types
		if (['user_data', 'financial_data', 'audit_logs'].includes(data.dataType)) {
			await flagSuspiciousActivity({
				userId: data.userId,
				activityType: 'bulk_data_access',
				severity: 'medium',
				description: `User accessed ${data.dataType}`,
				ipAddress: data.ipAddress,
			});
		}
	} catch (error) {
		console.error('Failed to log data access:', error);
	}
}

/**
 * Check and update API rate limit
 */
export async function checkRateLimit(data: {
	userId?: number;
	ipAddress: string;
	endpoint: string;
	limit?: number; // Requests per minute
}): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
	const db = await getDb();
	if (!db) {
		return { allowed: true, remaining: 60, resetAt: new Date() };
	}

	const limit = data.limit || 60; // Default: 60 requests per minute
	const now = new Date();
	const oneMinuteAgo = new Date(now.getTime() - 60000);

	try {
		// Get recent requests for this endpoint
		const recentRequests = await db
			.select({ count: apiRateLimits.requestCount })
			.from(apiRateLimits)
			.where(
				and(
					eq(apiRateLimits.ipAddress, data.ipAddress),
					eq(apiRateLimits.endpoint, data.endpoint),
					gte(apiRateLimits.windowStart, oneMinuteAgo.toISOString()),
					lte(apiRateLimits.windowEnd, now.toISOString())
				)
			);

		const totalRequests = recentRequests.reduce((sum, r) => sum + r.count, 0);
		const remaining = Math.max(0, limit - totalRequests);
		const resetAt = new Date(now.getTime() + 60000);

		if (totalRequests >= limit) {
			// Flag rate limit exceeded
			await flagSuspiciousActivity({
				userId: data.userId,
				activityType: 'api_rate_limit_exceeded',
				severity: 'medium',
				description: `Rate limit exceeded for endpoint ${data.endpoint} from IP ${data.ipAddress}`,
				ipAddress: data.ipAddress,
			});

			return { allowed: false, remaining: 0, resetAt };
		}

		// Update or create rate limit record
		await db.insert(apiRateLimits).values({
			userId: data.userId,
			ipAddress: data.ipAddress,
			endpoint: data.endpoint,
			requestCount: 1,
			windowStart: oneMinuteAgo.toISOString(),
			windowEnd: resetAt.toISOString(),
			limitExceeded: false,
			createdAt: now.toISOString(),
		});

		return { allowed: true, remaining, resetAt };
	} catch (error) {
		console.error('Failed to check rate limit:', error);
		return { allowed: true, remaining: 60, resetAt: new Date() };
	}
}

/**
 * Get activity logs with filtering
 */
export async function getActivityLogs(filters?: {
	userId?: number;
	action?: string;
	resource?: string;
	status?: string;
	ipAddress?: string;
	startDate?: Date;
	endDate?: Date;
	limit?: number;
	offset?: number;
}) {
	const db = await getDb();
	if (!db) return [];

	try {
		let query = db.select().from(activityLogs);

		const conditions = [];

		if (filters?.userId) {
			conditions.push(eq(activityLogs.userId, filters.userId));
		}
		if (filters?.action) {
			conditions.push(eq(activityLogs.action, filters.action));
		}
		if (filters?.resource) {
			conditions.push(eq(activityLogs.resource, filters.resource));
		}
		if (filters?.status) {
			conditions.push(eq(activityLogs.status, filters.status as any));
		}
		if (filters?.ipAddress) {
			conditions.push(eq(activityLogs.ipAddress, filters.ipAddress));
		}
		if (filters?.startDate) {
			conditions.push(gte(activityLogs.createdAt, filters.startDate.toISOString()));
		}
		if (filters?.endDate) {
			conditions.push(lte(activityLogs.createdAt, filters.endDate.toISOString()));
		}

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		query = query.orderBy(desc(activityLogs.createdAt));

		if (filters?.limit) {
			query = query.limit(filters.limit);
		}
		if (filters?.offset) {
			query = query.offset(filters.offset);
		}

		return query;
	} catch (error) {
		console.error('Failed to get activity logs:', error);
		return [];
	}
}

/**
 * Get suspicious activities
 */
export async function getSuspiciousActivities(filters?: {
	userId?: number;
	severity?: string;
	reviewed?: boolean;
	limit?: number;
	offset?: number;
}) {
	const db = await getDb();
	if (!db) return [];

	try {
		let query = db.select().from(suspiciousActivities);

		const conditions = [];

		if (filters?.userId) {
			conditions.push(eq(suspiciousActivities.userId, filters.userId));
		}
		if (filters?.severity) {
			conditions.push(eq(suspiciousActivities.severity, filters.severity as any));
		}
		if (filters?.reviewed !== undefined) {
			conditions.push(eq(suspiciousActivities.reviewed, filters.reviewed));
		}

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		query = query.orderBy(desc(suspiciousActivities.createdAt));

		if (filters?.limit) {
			query = query.limit(filters.limit);
		}
		if (filters?.offset) {
			query = query.offset(filters.offset);
		}

		return query;
	} catch (error) {
		console.error('Failed to get suspicious activities:', error);
		return [];
	}
}
