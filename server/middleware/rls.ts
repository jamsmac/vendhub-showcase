/**
 * Row-Level Security (RLS) utilities
 * Filters data based on user role and ownership
 */

import { UserRole } from './rbac';

export interface SecureQueryContext {
  userId: number;
  userRole: UserRole;
}

/**
 * Filter machines based on user role
 * - Admin: can see all machines
 * - Manager: can see all machines in their region
 * - Operator: can see only assigned machines
 * - User: cannot see machines
 */
export function filterMachinesByRole(
  machines: any[],
  context: SecureQueryContext
): any[] {
  if (context.userRole === 'admin') {
    return machines;
  }

  if (context.userRole === 'manager') {
    // TODO: Filter by manager's region/territory
    return machines;
  }

  if (context.userRole === 'operator') {
    // TODO: Filter by operator's assigned machines
    return machines.filter((m) => m.assignedOperatorId === context.userId);
  }

  return [];
}

/**
 * Filter inventory based on user role
 * - Admin: can see all inventory
 * - Manager: can see all inventory in their region
 * - Operator: can see inventory for assigned machines
 * - User: cannot see inventory
 */
export function filterInventoryByRole(
  inventory: any[],
  context: SecureQueryContext
): any[] {
  if (context.userRole === 'admin') {
    return inventory;
  }

  if (context.userRole === 'manager') {
    // TODO: Filter by manager's region/territory
    return inventory;
  }

  if (context.userRole === 'operator') {
    // TODO: Filter by operator's assigned machines
    return inventory;
  }

  return [];
}

/**
 * Filter users based on user role
 * - Admin: can see all users
 * - Manager: can see users in their region
 * - Others: cannot see users
 */
export function filterUsersByRole(
  users: any[],
  context: SecureQueryContext
): any[] {
  if (context.userRole === 'admin') {
    return users;
  }

  if (context.userRole === 'manager') {
    // TODO: Filter by manager's region/territory
    return users;
  }

  return [];
}

/**
 * Filter reports based on user role
 * - Admin: can see all reports
 * - Manager: can see reports for their region
 * - Operator: can see reports for assigned machines
 * - User: cannot see reports
 */
export function filterReportsByRole(
  reports: any[],
  context: SecureQueryContext
): any[] {
  if (context.userRole === 'admin') {
    return reports;
  }

  if (context.userRole === 'manager') {
    // TODO: Filter by manager's region/territory
    return reports;
  }

  if (context.userRole === 'operator') {
    // TODO: Filter by operator's assigned machines
    return reports;
  }

  return [];
}

/**
 * Check if user can access specific resource
 */
export function canAccessResource(
  resource: string,
  resourceOwnerId: number,
  context: SecureQueryContext
): boolean {
  // Admin can access everything
  if (context.userRole === 'admin') {
    return true;
  }

  // Manager can access resources in their region
  if (context.userRole === 'manager') {
    // TODO: Check if resource is in manager's region
    return true;
  }

  // Operator can only access their own resources
  if (context.userRole === 'operator') {
    return resourceOwnerId === context.userId;
  }

  return false;
}

/**
 * Check if user can modify resource
 */
export function canModifyResource(
  resource: string,
  resourceOwnerId: number,
  context: SecureQueryContext
): boolean {
  // Admin can modify everything
  if (context.userRole === 'admin') {
    return true;
  }

  // Manager can modify resources in their region
  if (context.userRole === 'manager') {
    // TODO: Check if resource is in manager's region
    return true;
  }

  // Operator can only modify their own resources
  if (context.userRole === 'operator') {
    return resourceOwnerId === context.userId;
  }

  return false;
}

/**
 * Check if user can delete resource
 */
export function canDeleteResource(
  resource: string,
  resourceOwnerId: number,
  context: SecureQueryContext
): boolean {
  // Only admin and manager can delete
  if (context.userRole === 'admin') {
    return true;
  }

  if (context.userRole === 'manager') {
    // TODO: Check if resource is in manager's region
    return true;
  }

  return false;
}

/**
 * Apply RLS to query results
 * Filters data based on user role and ownership
 */
export function applyRLS<T extends { id?: number; ownerId?: number }>(
  data: T[],
  context: SecureQueryContext,
  resourceType: 'machine' | 'inventory' | 'user' | 'report'
): T[] {
  switch (resourceType) {
    case 'machine':
      return filterMachinesByRole(data, context);
    case 'inventory':
      return filterInventoryByRole(data, context);
    case 'user':
      return filterUsersByRole(data, context);
    case 'report':
      return filterReportsByRole(data, context);
    default:
      return data;
  }
}

/**
 * Middleware to apply RLS to tRPC queries
 */
export function withRLS(resourceType: 'machine' | 'inventory' | 'user' | 'report') {
  return async (opts: any) => {
    const user = opts.ctx.user;

    if (!user) {
      opts.ctx.rls = {
        userId: 0,
        userRole: 'user',
        applyFilter: (data: any[]) => [],
      };
      return opts.next();
    }

    opts.ctx.rls = {
      userId: user.id,
      userRole: user.role,
      applyFilter: (data: any[]) =>
        applyRLS(data, { userId: user.id, userRole: user.role }, resourceType),
    };

    return opts.next();
  };
}
