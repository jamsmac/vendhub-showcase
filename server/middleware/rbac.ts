/**
 * Role-Based Access Control (RBAC) middleware and utilities
 */

export type UserRole = 'user' | 'operator' | 'manager' | 'admin';

export interface Permission {
  resource: string;
  action: string;
}

/**
 * Define role-based permissions
 * Maps each role to allowed actions on resources
 */
export const rolePermissions: Record<UserRole, Permission[]> = {
  user: [
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'update' },
  ],
  operator: [
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'update' },
    { resource: 'machines', action: 'read' },
    { resource: 'machines', action: 'update' },
    { resource: 'inventory', action: 'read' },
    { resource: 'inventory', action: 'update' },
    { resource: 'reports', action: 'read' },
  ],
  manager: [
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'update' },
    { resource: 'machines', action: 'read' },
    { resource: 'machines', action: 'create' },
    { resource: 'machines', action: 'update' },
    { resource: 'machines', action: 'delete' },
    { resource: 'inventory', action: 'read' },
    { resource: 'inventory', action: 'create' },
    { resource: 'inventory', action: 'update' },
    { resource: 'inventory', action: 'delete' },
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'create' },
    { resource: 'users', action: 'read' },
  ],
  admin: [
    // Admin has all permissions
    { resource: '*', action: '*' },
  ],
};

/**
 * Check if a user role has permission for a specific action on a resource
 */
export function hasPermission(
  role: UserRole,
  resource: string,
  action: string
): boolean {
  const permissions = rolePermissions[role];

  if (!permissions) {
    return false;
  }

  // Check for wildcard permissions (admin)
  if (permissions.some((p) => p.resource === '*' && p.action === '*')) {
    return true;
  }

  // Check for specific permission
  return permissions.some(
    (p) =>
      (p.resource === resource || p.resource === '*') &&
      (p.action === action || p.action === '*')
  );
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Get all resources accessible by a role
 */
export function getAccessibleResources(role: UserRole): string[] {
  const permissions = rolePermissions[role];
  if (!permissions) {
    return [];
  }

  const resources = new Set<string>();
  permissions.forEach((p) => {
    if (p.resource !== '*') {
      resources.add(p.resource);
    }
  });

  return Array.from(resources);
}

/**
 * Check if user role is at least the required level
 * Role hierarchy: user < operator < manager < admin
 */
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    operator: 2,
    manager: 3,
    admin: 4,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Create a permission checker function
 * Useful for tRPC middleware
 */
export function createPermissionChecker(userRole: UserRole) {
  return {
    can: (resource: string, action: string) =>
      hasPermission(userRole, resource, action),
    canAccess: (resource: string) =>
      hasPermission(userRole, resource, 'read'),
    canCreate: (resource: string) =>
      hasPermission(userRole, resource, 'create'),
    canUpdate: (resource: string) =>
      hasPermission(userRole, resource, 'update'),
    canDelete: (resource: string) =>
      hasPermission(userRole, resource, 'delete'),
    hasRole: (role: UserRole) => hasRoleLevel(userRole, role),
    getPermissions: () => getPermissions(userRole),
  };
}

/**
 * Audit log entry for permission checks
 */
export interface AuditLogEntry {
  userId: number;
  userRole: UserRole;
  resource: string;
  action: string;
  allowed: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log permission check for audit trail
 */
export function logPermissionCheck(entry: AuditLogEntry): void {
  // TODO: Implement audit logging to database
  if (!entry.allowed) {
    console.warn(
      `Permission denied: User ${entry.userId} (${entry.userRole}) tried to ${entry.action} on ${entry.resource}`
    );
  }
}
