import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { requireRole } from '../middleware/rbacMiddleware';
import {
	getAllPermissions,
	getPermissionsByCategory,
	getRolePermissions,
	hasPermission,
	grantPermission,
	revokePermission,
	updateRolePermissions,
	getPermissionChangeHistory,
	getPermissionGroups,
	getGroupPermissions,
	createPermission,
	updatePermission,
	deletePermission,
	getRoleHierarchy,
	getPermissionStats,
} from '../db-permissions';

export const permissionsRouter = router({
	/**
	 * Get all permissions
	 */
	getAllPermissions: protectedProcedure
		.use(requireRole('admin'))
		.query(async () => {
			return getAllPermissions();
		}),

	/**
	 * Get permissions by category
	 */
	getPermissionsByCategory: protectedProcedure
		.use(requireRole('admin'))
		.input(z.object({ category: z.string() }))
		.query(async ({ input }) => {
			return getPermissionsByCategory(input.category);
		}),

	/**
	 * Get permissions for a role
	 */
	getRolePermissions: protectedProcedure
		.use(requireRole('admin'))
		.input(z.object({ role: z.enum(['user', 'operator', 'manager', 'admin']) }))
		.query(async ({ input }) => {
			return getRolePermissions(input.role);
		}),

	/**
	 * Check if a role has a permission
	 */
	hasPermission: protectedProcedure
		.use(requireRole('admin'))
		.input(
			z.object({
				role: z.enum(['user', 'operator', 'manager', 'admin']),
				permissionKey: z.string(),
			})
		)
		.query(async ({ input }) => {
			return hasPermission(input.role, input.permissionKey);
		}),

	/**
	 * Grant permission to a role
	 */
	grantPermission: protectedProcedure
		.use(requireRole('admin'))
		.input(
			z.object({
				role: z.enum(['user', 'operator', 'manager', 'admin']),
				permissionId: z.number().int(),
				notes: z.string().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			if (!ctx.user) throw new Error('User not authenticated');

			await grantPermission(input.role, input.permissionId, ctx.user.id, input.notes);
			return { success: true };
		}),

	/**
	 * Revoke permission from a role
	 */
	revokePermission: protectedProcedure
		.use(requireRole('admin'))
		.input(
			z.object({
				role: z.enum(['user', 'operator', 'manager', 'admin']),
				permissionId: z.number().int(),
				reason: z.string().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			if (!ctx.user) throw new Error('User not authenticated');

			await revokePermission(input.role, input.permissionId, ctx.user.id, input.reason);
			return { success: true };
		}),

	/**
	 * Bulk update permissions for a role
	 */
	updateRolePermissions: protectedProcedure
		.use(requireRole('admin'))
		.input(
			z.object({
				role: z.enum(['user', 'operator', 'manager', 'admin']),
				permissionIds: z.array(z.number().int()),
				reason: z.string().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			if (!ctx.user) throw new Error('User not authenticated');

			const result = await updateRolePermissions(
				input.role,
				input.permissionIds,
				ctx.user.id,
				input.reason
			);
			return result;
		}),

	/**
	 * Get permission change history
	 */
	getPermissionChangeHistory: protectedProcedure
		.use(requireRole('admin'))
		.input(
			z.object({
				role: z.enum(['user', 'operator', 'manager', 'admin']).optional(),
				page: z.number().int().positive().default(1),
				limit: z.number().int().positive().default(50),
			})
		)
		.query(async ({ input }) => {
			const offset = (input.page - 1) * input.limit;
			const history = await getPermissionChangeHistory(input.role, input.limit, offset);

			return {
				history,
				page: input.page,
				limit: input.limit,
				total: history.length,
			};
		}),

	/**
	 * Get permission groups
	 */
	getPermissionGroups: protectedProcedure
		.use(requireRole('admin'))
		.query(async () => {
			return getPermissionGroups();
		}),

	/**
	 * Get permissions in a group
	 */
	getGroupPermissions: protectedProcedure
		.use(requireRole('admin'))
		.input(z.object({ groupId: z.number().int() }))
		.query(async ({ input }) => {
			return getGroupPermissions(input.groupId);
		}),

	/**
	 * Create a new permission
	 */
	createPermission: protectedProcedure
		.use(requireRole('admin'))
		.input(
			z.object({
				key: z.string().min(3).max(100),
				name: z.string().min(3).max(255),
				category: z.string().min(3).max(50),
				description: z.string().optional(),
				riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
			})
		)
		.mutation(async ({ input }) => {
			return createPermission(
				input.key,
				input.name,
				input.category,
				input.description,
				input.riskLevel
			);
		}),

	/**
	 * Update a permission
	 */
	updatePermission: protectedProcedure
		.use(requireRole('admin'))
		.input(
			z.object({
				id: z.number().int(),
				name: z.string().optional(),
				description: z.string().optional(),
				riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
			})
		)
		.mutation(async ({ input }) => {
			const { id, ...updates } = input;
			return updatePermission(id, updates);
		}),

	/**
	 * Delete a permission
	 */
	deletePermission: protectedProcedure
		.use(requireRole('admin'))
		.input(z.object({ id: z.number().int() }))
		.mutation(async ({ input }) => {
			return deletePermission(input.id);
		}),

	/**
	 * Get role hierarchy (all permissions for all roles)
	 */
	getRoleHierarchy: protectedProcedure
		.use(requireRole('admin'))
		.query(async () => {
			return getRoleHierarchy();
		}),

	/**
	 * Get permission statistics
	 */
	getPermissionStats: protectedProcedure
		.use(requireRole('admin'))
		.query(async () => {
			return getPermissionStats();
		}),
});
