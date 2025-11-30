import { getDb } from './db';
import { users, roleChanges } from '../drizzle/schema';
import { eq, like, and, gte, lte } from 'drizzle-orm';

export type UserStatus = 'active' | 'suspended' | 'inactive';
export type UserRole = 'user' | 'operator' | 'manager' | 'admin';

/**
 * Get all users with optional filtering
 */
export async function getAllUsers(filters?: {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');

  let query = db.select().from(users);

  // Apply filters
  const conditions = [];

  if (filters?.search) {
    conditions.push(
      like(users.name, `%${filters.search}%`) ||
      like(users.email, `%${filters.search}%`)
    );
  }

  if (filters?.role) {
    conditions.push(eq(users.role, filters.role as any));
  }

  if (filters?.status) {
    conditions.push(eq(users.status, filters.status as any));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  // Apply pagination
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  return query;
}

/**
 * Get user count with optional filtering
 */
export async function getUserCount(filters?: {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');

  const conditions = [];

  if (filters?.search) {
    conditions.push(
      like(users.name, `%${filters.search}%`) ||
      like(users.email, `%${filters.search}%`)
    );
  }

  if (filters?.role) {
    conditions.push(eq(users.role, filters.role as any));
  }

  if (filters?.status) {
    conditions.push(eq(users.status, filters.status as any));
  }

  let query = db.select({ count: users.id }).from(users);

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const result = await query;
  return result.length;
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: number,
  newRole: UserRole,
  changedBy: number,
  reason?: string
) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');

  // Get current user to track old role
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Update user role
  await db.update(users).set({
    role: newRole as any,
    updatedAt: new Date().toISOString(),
  }).where(eq(users.id, userId));

  // Log role change
  if (roleChanges) {
    await db.insert(roleChanges).values({
      userId,
      oldRole: user.role as any,
      newRole: newRole as any,
      changedBy,
      reason,
      changedAt: new Date().toISOString(),
    });
  }

  return { success: true };
}

/**
 * Suspend user account
 */
export async function suspendUser(
  userId: number,
  reason: string,
  suspendedBy: number
) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');

  const now = new Date().toISOString();

  await db.update(users).set({
    status: 'suspended' as any,
    suspendedAt: now,
    suspendedReason: reason,
    suspendedBy,
    updatedAt: now,
  }).where(eq(users.id, userId));

  return { success: true };
}

/**
 * Reactivate suspended user
 */
export async function reactivateUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');

  const now = new Date().toISOString();

  await db.update(users).set({
    status: 'active' as any,
    suspendedAt: null,
    suspendedReason: null,
    suspendedBy: null,
    updatedAt: now,
  }).where(eq(users.id, userId));

  return { success: true };
}

/**
 * Get user statistics
 */
export async function getUserStatistics() {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');

  // Total users
  const totalUsers = await db.select({ count: users.id }).from(users);

  // Users by role
  const usersByRole = await db
    .select({
      role: users.role,
      count: users.id,
    })
    .from(users)
    .groupBy(users.role);

  // Users by status
  const usersByStatus = await db
    .select({
      status: users.status,
      count: users.id,
    })
    .from(users)
    .groupBy(users.status);

  // Active users (signed in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeUsers = await db
    .select({ count: users.id })
    .from(users)
    .where(gte(users.lastSignedIn, thirtyDaysAgo.toISOString()));

  return {
    total: totalUsers.length,
    byRole: usersByRole,
    byStatus: usersByStatus,
    activeLastMonth: activeUsers.length,
  };
}

/**
 * Get user role change history
 */
export async function getUserRoleChangeHistory(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');

  if (!roleChanges) {
    return [];
  }

  return db
    .select()
    .from(roleChanges)
    .where(eq(roleChanges.userId, userId))
    .orderBy(roleChanges.changedAt)
    .limit(limit);
}

/**
 * Get all role changes with optional filtering
 */
export async function getAllRoleChanges(filters?: {
  userId?: number;
  changedBy?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not connected');

  if (!roleChanges) {
    return [];
  }

  let query = db.select().from(roleChanges);

  const conditions = [];

  if (filters?.userId) {
    conditions.push(eq(roleChanges.userId, filters.userId));
  }

  if (filters?.changedBy) {
    conditions.push(eq(roleChanges.changedBy, filters.changedBy));
  }

  if (filters?.startDate) {
    conditions.push(gte(roleChanges.changedAt, filters.startDate.toISOString()));
  }

  if (filters?.endDate) {
    conditions.push(lte(roleChanges.changedAt, filters.endDate.toISOString()));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  return query.orderBy(roleChanges.changedAt);
}
