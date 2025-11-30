import { trpc } from '@/lib/trpc';

export type UserRole = 'user' | 'operator' | 'manager' | 'admin';

const roleHierarchy: Record<UserRole, number> = {
  user: 1,
  operator: 2,
  manager: 3,
  admin: 4,
};

/**
 * Hook to access current user and auth utilities
 * Usage:
 * const { user, isAdmin, canAccess, logout } = useAuth();
 */
export function useAuth() {
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;
  const isOperator = user?.role === 'operator' || isManager;

  /**
   * Check if user has at least the required role
   */
  const hasRole = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    const userLevel = roleHierarchy[user.role as UserRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole];
    return userLevel >= requiredLevel;
  };

  /**
   * Check if user can access a specific resource
   * TODO: Implement actual permission checking
   */
  const canAccess = (resource: string): boolean => {
    if (!user) return false;
    // For now, use role-based access
    if (resource === 'admin') return isAdmin;
    if (resource === 'manager') return isManager;
    if (resource === 'operator') return isOperator;
    return true;
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // Clear auth token from localStorage
      localStorage.removeItem('authToken');
      // Redirect to login
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isManager,
    isOperator,
    hasRole,
    canAccess,
    logout,
  };
}

/**
 * Hook to check if user has specific permission
 * TODO: Implement actual permission checking from backend
 */
export function usePermission(resource: string, action: string) {
  const { user } = useAuth();

  if (!user) return false;

  // For now, use role-based access
  const adminResources = ['users', 'settings', 'reports', 'audit'];
  const managerResources = ['machines', 'inventory', 'products', 'users', 'reports'];
  const operatorResources = ['machines', 'inventory', 'products'];

  if (user.role === 'admin') return true;
  if (user.role === 'manager') return managerResources.includes(resource);
  if (user.role === 'operator') return operatorResources.includes(resource);

  return false;
}

/**
 * Hook to check if user can perform specific action
 */
export function useCanPerform(resource: string, action: 'read' | 'create' | 'update' | 'delete') {
  const { user } = useAuth();

  if (!user) return false;

  // Admins can do everything
  if (user.role === 'admin') return true;

  // Managers can do most things except delete users
  if (user.role === 'manager') {
    if (resource === 'users' && action === 'delete') return false;
    return true;
  }

  // Operators can only read and update (not create/delete)
  if (user.role === 'operator') {
    return action === 'read' || action === 'update';
  }

  return false;
}
