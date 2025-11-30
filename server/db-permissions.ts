import { getDb } from './db';
import {
	permissions,
	rolePermissions,
	permissionChanges,
	permissionGroups,
	permissionGroupMembers,
} from '../drizzle/schema';
import { eq, and, inArray } from 'drizzle-orm';

export type UserRole = 'user' | 'operator' | 'manager' | 'admin';

/**
 * Get all permissions
 */
export async function getAllPermissions() {
	const db = await getDb();
	return db.select().from(permissions).orderBy(permissions.category, permissions.name);
}

/**
 * Get permissions by category
 */
export async function getPermissionsByCategory(category: string) {
	const db = await getDb();
	return db
		.select()
		.from(permissions)
		.where(eq(permissions.category, category))
		.orderBy(permissions.name);
}

/**
 * Get permissions for a specific role
 */
export async function getRolePermissions(role: UserRole) {
	const db = await getDb();
	const result = await db
		.select({
			id: permissions.id,
			key: permissions.key,
			name: permissions.name,
			description: permissions.description,
			category: permissions.category,
			riskLevel: permissions.riskLevel,
		})
		.from(rolePermissions)
		.innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
		.where(eq(rolePermissions.role, role))
		.orderBy(permissions.category, permissions.name);

	return result;
}

/**
 * Check if a role has a specific permission
 */
export async function hasPermission(role: UserRole, permissionKey: string): Promise<boolean> {
	const db = await getDb();
	const result = await db
		.select({ id: permissions.id })
		.from(rolePermissions)
		.innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
		.where(and(eq(rolePermissions.role, role), eq(permissions.key, permissionKey)))
		.limit(1);

	return result.length > 0;
}

/**
 * Grant permission to a role
 */
export async function grantPermission(
	role: UserRole,
	permissionId: number,
	grantedBy: number,
	notes?: string
) {
	const db = await getDb();

	// Check if permission already exists
	const existing = await db
		.select()
		.from(rolePermissions)
		.where(and(eq(rolePermissions.role, role), eq(rolePermissions.permissionId, permissionId)))
		.limit(1);

	if (existing.length > 0) {
		return existing[0];
	}

	// Grant the permission
	const result = await db.insert(rolePermissions).values({
		role,
		permissionId,
		grantedBy,
		notes,
	});

	// Log the change
	await db.insert(permissionChanges).values({
		role,
		permissionId,
		action: 'granted',
		changedBy: grantedBy,
		reason: notes,
	});

	return result;
}

/**
 * Revoke permission from a role
 */
export async function revokePermission(
	role: UserRole,
	permissionId: number,
	revokedBy: number,
	reason?: string
) {
	const db = await getDb();

	// Delete the permission
	await db
		.delete(rolePermissions)
		.where(and(eq(rolePermissions.role, role), eq(rolePermissions.permissionId, permissionId)));

	// Log the change
	await db.insert(permissionChanges).values({
		role,
		permissionId,
		action: 'revoked',
		changedBy: revokedBy,
		reason,
	});
}

/**
 * Bulk update permissions for a role
 */
export async function updateRolePermissions(
	role: UserRole,
	permissionIds: number[],
	updatedBy: number,
	reason?: string
) {
	const db = await getDb();

	// Get current permissions
	const currentPermissions = await db
		.select({ permissionId: rolePermissions.permissionId })
		.from(rolePermissions)
		.where(eq(rolePermissions.role, role));

	const currentIds = currentPermissions.map((p) => p.permissionId);
	const newIds = permissionIds;

	// Find permissions to add and remove
	const toAdd = newIds.filter((id) => !currentIds.includes(id));
	const toRemove = currentIds.filter((id) => !newIds.includes(id));

	// Remove old permissions
	if (toRemove.length > 0) {
		await db
			.delete(rolePermissions)
			.where(
				and(eq(rolePermissions.role, role), inArray(rolePermissions.permissionId, toRemove))
			);

		// Log removals
		for (const permId of toRemove) {
			await db.insert(permissionChanges).values({
				role,
				permissionId: permId,
				action: 'revoked',
				changedBy: updatedBy,
				reason: reason || 'Bulk update',
			});
		}
	}

	// Add new permissions
	if (toAdd.length > 0) {
		await db.insert(rolePermissions).values(
			toAdd.map((permId) => ({
				role,
				permissionId: permId,
				grantedBy: updatedBy,
				notes: reason || 'Bulk update',
			}))
		);

		// Log additions
		for (const permId of toAdd) {
			await db.insert(permissionChanges).values({
				role,
				permissionId: permId,
				action: 'granted',
				changedBy: updatedBy,
				reason: reason || 'Bulk update',
			});
		}
	}

	return { added: toAdd.length, removed: toRemove.length };
}

/**
 * Get permission change history
 */
export async function getPermissionChangeHistory(
	role?: UserRole,
	limit: number = 100,
	offset: number = 0
) {
	const db = await getDb();

	let query = db
		.select({
			id: permissionChanges.id,
			role: permissionChanges.role,
			permissionName: permissions.name,
			permissionKey: permissions.key,
			action: permissionChanges.action,
			changedBy: permissionChanges.changedBy,
			reason: permissionChanges.reason,
			createdAt: permissionChanges.createdAt,
		})
		.from(permissionChanges)
		.innerJoin(permissions, eq(permissionChanges.permissionId, permissions.id));

	if (role) {
		query = query.where(eq(permissionChanges.role, role));
	}

	return query.orderBy(permissionChanges.createdAt).limit(limit).offset(offset);
}

/**
 * Get permission groups
 */
export async function getPermissionGroups() {
	const db = await getDb();
	return db.select().from(permissionGroups).orderBy(permissionGroups.category);
}

/**
 * Get permissions in a group
 */
export async function getGroupPermissions(groupId: number) {
	const db = await getDb();
	return db
		.select({
			id: permissions.id,
			key: permissions.key,
			name: permissions.name,
			description: permissions.description,
			category: permissions.category,
			riskLevel: permissions.riskLevel,
		})
		.from(permissionGroupMembers)
		.innerJoin(permissions, eq(permissionGroupMembers.permissionId, permissions.id))
		.where(eq(permissionGroupMembers.groupId, groupId))
		.orderBy(permissions.name);
}

/**
 * Create a permission
 */
export async function createPermission(
	key: string,
	name: string,
	category: string,
	description?: string,
	riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
) {
	const db = await getDb();
	return db.insert(permissions).values({
		key,
		name,
		category,
		description,
		riskLevel,
	});
}

/**
 * Update a permission
 */
export async function updatePermission(
	id: number,
	updates: {
		name?: string;
		description?: string;
		riskLevel?: 'low' | 'medium' | 'high' | 'critical';
	}
) {
	const db = await getDb();
	return db.update(permissions).set(updates).where(eq(permissions.id, id));
}

/**
 * Delete a permission
 */
export async function deletePermission(id: number) {
	const db = await getDb();

	// Delete from role permissions
	await db.delete(rolePermissions).where(eq(rolePermissions.permissionId, id));

	// Delete from permission groups
	await db.delete(permissionGroupMembers).where(eq(permissionGroupMembers.permissionId, id));

	// Delete the permission
	return db.delete(permissions).where(eq(permissions.id, id));
}

/**
 * Get role hierarchy (what permissions each role has)
 */
export async function getRoleHierarchy() {
	const roles: UserRole[] = ['user', 'operator', 'manager', 'admin'];
	const hierarchy: Record<UserRole, any[]> = {
		user: [],
		operator: [],
		manager: [],
		admin: [],
	};

	for (const role of roles) {
		hierarchy[role] = await getRolePermissions(role);
	}

	return hierarchy;
}

/**
 * Get permission statistics
 */
export async function getPermissionStats() {
	const db = await getDb();

	const totalPermissions = await db.select().from(permissions);
	const allRolePermissions = await db.select().from(rolePermissions);

	const stats = {
		totalPermissions: totalPermissions.length,
		byCategory: {} as Record<string, number>,
		byRole: {
			user: 0,
			operator: 0,
			manager: 0,
			admin: 0,
		} as Record<UserRole, number>,
		byRiskLevel: {
			low: 0,
			medium: 0,
			high: 0,
			critical: 0,
		} as Record<string, number>,
	};

	// Count by category
	totalPermissions.forEach((perm: any) => {
		stats.byCategory[perm.category] = (stats.byCategory[perm.category] || 0) + 1;
		stats.byRiskLevel[perm.riskLevel] = (stats.byRiskLevel[perm.riskLevel] || 0) + 1;
	});

	// Count by role
	allRolePermissions.forEach((rp: any) => {
		stats.byRole[rp.role as UserRole]++;
	});

	return stats;
}
