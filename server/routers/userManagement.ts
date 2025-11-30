import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as dbUsers from "../db-users";
import { requireRole } from "../middleware/rbacMiddleware";

export const userManagementRouter = router({
  /**
   * Get all users (admin only)
   */
  listUsers: protectedProcedure
    .use(requireRole('admin'))
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(['user', 'operator', 'manager', 'admin']).optional(),
        status: z.enum(['active', 'suspended', 'inactive']).optional(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().default(20),
      })
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;

      const users = await dbUsers.getAllUsers({
        search: input.search,
        role: input.role,
        status: input.status,
        limit: input.limit,
        offset,
      });

      const total = await dbUsers.getUserCount({
        search: input.search,
        role: input.role,
        status: input.status,
      });

      return {
        users,
        total,
        page: input.page,
        limit: input.limit,
        pages: Math.ceil(total / input.limit),
      };
    }),

  /**
   * Get user statistics (admin only)
   */
  getStatistics: protectedProcedure
    .use(requireRole('admin'))
    .query(async () => {
      return dbUsers.getUserStatistics();
    }),

  /**
   * Update user role (admin only)
   */
  updateRole: protectedProcedure
    .use(requireRole('admin'))
    .input(
      z.object({
        userId: z.number().int().positive(),
        newRole: z.enum(['user', 'operator', 'manager', 'admin']),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error('User not authenticated');
      }

      // Prevent users from changing their own role
      if (input.userId === ctx.user.id) {
        throw new Error('Cannot change your own role');
      }

      return dbUsers.updateUserRole(
        input.userId,
        input.newRole,
        ctx.user.id,
        input.reason
      );
    }),

  /**
   * Suspend user account (admin only)
   */
  suspendUser: protectedProcedure
    .use(requireRole('admin'))
    .input(
      z.object({
        userId: z.number().int().positive(),
        reason: z.string().min(1, 'Reason is required'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error('User not authenticated');
      }

      // Prevent admins from suspending themselves
      if (input.userId === ctx.user.id) {
        throw new Error('Cannot suspend your own account');
      }

      return dbUsers.suspendUser(input.userId, input.reason, ctx.user.id);
    }),

  /**
   * Reactivate suspended user (admin only)
   */
  reactivateUser: protectedProcedure
    .use(requireRole('admin'))
    .input(
      z.object({
        userId: z.number().int().positive(),
      })
    )
    .mutation(async ({ input }) => {
      return dbUsers.reactivateUser(input.userId);
    }),

  /**
   * Get user role change history (admin only)
   */
  getRoleChangeHistory: protectedProcedure
    .use(requireRole('admin'))
    .input(
      z.object({
        userId: z.number().int().positive().optional(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().default(20),
      })
    )
    .query(async ({ input }) => {
      if (input.userId) {
        const changes = await dbUsers.getUserRoleChangeHistory(
          input.userId,
          input.limit
        );
        return {
          changes,
          total: changes.length,
        };
      }

      const offset = (input.page - 1) * input.limit;
      const changes = await dbUsers.getAllRoleChanges({
        limit: input.limit,
        offset,
      });

      return {
        changes,
        total: changes.length,
        page: input.page,
        limit: input.limit,
      };
    }),

  /**
   * Export users as CSV (admin only)
   */
  exportUsers: protectedProcedure
    .use(requireRole('admin'))
    .input(
      z.object({
        role: z.enum(['user', 'operator', 'manager', 'admin']).optional(),
        status: z.enum(['active', 'suspended', 'inactive']).optional(),
      })
    )
    .query(async ({ input }) => {
      const users = await dbUsers.getAllUsers({
        role: input.role,
        status: input.status,
      });

      // Generate CSV content
      const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Created At', 'Last Signed In'];
      const rows = users.map((user: any) => [
        user.id,
        user.name || '',
        user.email || '',
        user.role,
        user.status,
        user.createdAt,
        user.lastSignedIn,
      ]);

      const csv = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return {
        csv,
        filename: `users-${new Date().toISOString().split('T')[0]}.csv`,
      };
    }),
});
