import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Lock } from 'lucide-react';

export type UserRole = 'user' | 'operator' | 'manager' | 'admin';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredPermissions?: Array<{ resource: string; action: string }>;
  fallback?: ReactNode;
}

/**
 * Component to protect routes based on user role and permissions
 * Usage:
 * <ProtectedRoute requiredRole="manager">
 *   <AdminPanel />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermissions,
  fallback,
}: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-200 mb-4">
            <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
          <p className="text-slate-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login
    setLocation('/auth');
    return null;
  }

  // Check role requirement
  if (requiredRole) {
    const roleHierarchy: Record<UserRole, number> = {
      user: 1,
      operator: 2,
      manager: 3,
      admin: 4,
    };

    const userLevel = roleHierarchy[user.role as UserRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole];

    if (userLevel < requiredLevel) {
      return fallback || <AccessDeniedPage requiredRole={requiredRole} />;
    }
  }

  // Check permissions requirement
  if (requiredPermissions && requiredPermissions.length > 0) {
    // TODO: Implement permission checking
    // For now, we'll just check role-based access
  }

  return <>{children}</>;
}

/**
 * Component to show/hide content based on user role
 */
interface ConditionalRenderProps {
  children: ReactNode;
  requiredRole?: UserRole;
  fallback?: ReactNode;
}

export function RoleBasedRender({
  children,
  requiredRole,
  fallback,
}: ConditionalRenderProps) {
  const { data: user } = trpc.auth.me.useQuery();

  if (!user) {
    return fallback || null;
  }

  if (requiredRole) {
    const roleHierarchy: Record<UserRole, number> = {
      user: 1,
      operator: 2,
      manager: 3,
      admin: 4,
    };

    const userLevel = roleHierarchy[user.role as UserRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole];

    if (userLevel < requiredLevel) {
      return fallback || null;
    }
  }

  return <>{children}</>;
}

/**
 * Component to check if user has specific permission
 */
interface PermissionBasedRenderProps {
  children: ReactNode;
  resource: string;
  action: string;
  fallback?: ReactNode;
}

export function PermissionBasedRender({
  children,
  resource,
  action,
  fallback,
}: PermissionBasedRenderProps) {
  const { data: user } = trpc.auth.me.useQuery();

  if (!user) {
    return fallback || null;
  }

  // TODO: Implement actual permission checking
  // For now, use role-based access as fallback
  const canAccess = user.role === 'admin' || user.role === 'manager';

  if (!canAccess) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Access Denied Page Component
 */
function AccessDeniedPage({ requiredRole }: { requiredRole: UserRole }) {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="p-8 bg-slate-800 border-slate-700 max-w-md w-full">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-900/30 border border-red-700 flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white">Доступ запрещен</h1>

          <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm text-red-200">
                Для доступа к этой странице требуется роль <strong>{requiredRole}</strong> или выше.
              </p>
              <p className="text-xs text-red-300 mt-2">
                Если вы считаете, что это ошибка, пожалуйста, свяжитесь с администратором.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => setLocation('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Вернуться на главную
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation('/profile')}
              className="w-full text-blue-400 border-blue-400 hover:bg-blue-400/10"
            >
              Перейти в профиль
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
