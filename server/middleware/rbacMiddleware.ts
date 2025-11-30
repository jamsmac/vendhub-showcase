import { TRPCError } from '@trpc/server';
import { hasPermission, createPermissionChecker, UserRole } from './rbac';

/**
 * Create a tRPC middleware that checks permissions
 * Usage: .use(requirePermission('machines', 'read'))
 */
export function requirePermission(resource: string, action: string) {
  return async (opts: any) => {
    const user = opts.ctx.user;

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    const allowed = hasPermission(user.role as UserRole, resource, action);

    if (!allowed) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `You do not have permission to ${action} ${resource}`,
      });
    }

    return opts.next();
  };
}

/**
 * Create a tRPC middleware that checks role level
 * Usage: .use(requireRole('manager'))
 */
export function requireRole(minRole: UserRole) {
  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    operator: 2,
    manager: 3,
    admin: 4,
  };

  return async (opts: any) => {
    const user = opts.ctx.user;

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    const userLevel = roleHierarchy[user.role as UserRole] || 0;
    const requiredLevel = roleHierarchy[minRole];

    if (userLevel < requiredLevel) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `This action requires at least ${minRole} role`,
      });
    }

    return opts.next();
  };
}

/**
 * Create a tRPC middleware that provides permission checker
 * Usage: .use(withPermissions())
 */
export function withPermissions() {
  return async (opts: any) => {
    const user = opts.ctx.user;

    if (!user) {
      opts.ctx.permissions = null;
      return opts.next();
    }

    opts.ctx.permissions = createPermissionChecker(user.role as UserRole);
    return opts.next();
  };
}

/**
 * Create a tRPC middleware that checks multiple permissions
 * Usage: .use(requireAnyPermission([
 *   { resource: 'machines', action: 'read' },
 *   { resource: 'machines', action: 'admin' }
 * ]))
 */
export function requireAnyPermission(
  permissions: Array<{ resource: string; action: string }>
) {
  return async (opts: any) => {
    const user = opts.ctx.user;

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    const hasAny = permissions.some((p) =>
      hasPermission(user.role as UserRole, p.resource, p.action)
    );

    if (!hasAny) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action',
      });
    }

    return opts.next();
  };
}

/**
 * Create a tRPC middleware that checks all permissions
 * Usage: .use(requireAllPermissions([
 *   { resource: 'machines', action: 'read' },
 *   { resource: 'machines', action: 'update' }
 * ]))
 */
export function requireAllPermissions(
  permissions: Array<{ resource: string; action: string }>
) {
  return async (opts: any) => {
    const user = opts.ctx.user;

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    const hasAll = permissions.every((p) =>
      hasPermission(user.role as UserRole, p.resource, p.action)
    );

    if (!hasAll) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have all required permissions',
      });
    }

    return opts.next();
  };
}
