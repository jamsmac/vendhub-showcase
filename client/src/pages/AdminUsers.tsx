import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserListTable } from '@/components/admin/UserListTable';
import { RoleAssignmentDialog } from '@/components/admin/RoleAssignmentDialog';
import { SuspensionDialog } from '@/components/admin/SuspensionDialog';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Users,
  Shield,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

type UserRole = 'user' | 'operator' | 'manager' | 'admin';
type UserStatus = 'active' | 'suspended' | 'inactive';

export default function AdminUsers() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole>('user');
  const [selectedUserStatus, setSelectedUserStatus] = useState<UserStatus>('active');
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showSuspensionDialog, setShowSuspensionDialog] = useState(false);

  const { data: stats, isLoading: statsLoading } = trpc.userManagement.getStatistics.useQuery();
  const { refetch: refetchUsers } = trpc.userManagement.listUsers.useQuery({
    page: 1,
    limit: 20,
  });

  const handleSelectUser = (userId: number) => {
    // This would typically fetch user details
    setSelectedUserId(userId);
  };

  const handleRoleChange = (userId: number, currentRole: UserRole) => {
    setSelectedUserId(userId);
    setSelectedUserRole(currentRole);
    setShowRoleDialog(true);
  };

  const handleSuspendUser = (userId: number) => {
    setSelectedUserId(userId);
    setShowSuspensionDialog(true);
  };

  const handleRoleDialogClose = () => {
    setShowRoleDialog(false);
    setSelectedUserId(null);
  };

  const handleSuspensionDialogClose = () => {
    setShowSuspensionDialog(false);
    setSelectedUserId(null);
  };

  const handleSuccess = () => {
    refetchUsers();
    toast.success('Операция выполнена успешно');
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Управление пользователями</h1>
            <p className="text-slate-400 mt-1">
              Управление ролями, статусами и просмотр журнала аудита
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => refetchUsers()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Clock className="w-4 h-4 mr-2" />
              Обновить
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Users */}
            <Card className="p-4 bg-slate-800 border-slate-700">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Всего пользователей</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </Card>

            {/* Active Users */}
            <Card className="p-4 bg-slate-800 border-slate-700">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Активны за 30 дней</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stats.activeLastMonth}
                  </p>
                </div>
                <div className="p-3 bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </Card>

            {/* Admins Count */}
            <Card className="p-4 bg-slate-800 border-slate-700">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Администраторы</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stats.byRole?.find((r: any) => r.role === 'admin')?.count || 0}
                  </p>
                </div>
                <div className="p-3 bg-red-900/30 rounded-lg">
                  <Shield className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </Card>

            {/* Suspended Users */}
            <Card className="p-4 bg-slate-800 border-slate-700">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Заблокированы</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stats.byStatus?.find((s: any) => s.status === 'suspended')?.count || 0}
                  </p>
                </div>
                <div className="p-3 bg-red-900/30 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="bg-slate-800 border-b border-slate-700">
            <TabsTrigger value="users" className="text-slate-300 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-slate-300 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Журнал аудита
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <UserListTable
                onSelectUser={handleSelectUser}
                onRoleChange={handleRoleChange}
                onSuspendUser={handleSuspendUser}
              />
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="space-y-4">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <AuditLogViewer />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        {selectedUserId && (
          <>
            <RoleAssignmentDialog
              open={showRoleDialog}
              userId={selectedUserId}
              userName={selectedUserName}
              currentRole={selectedUserRole}
              onClose={handleRoleDialogClose}
              onSuccess={handleSuccess}
            />
            <SuspensionDialog
              open={showSuspensionDialog}
              userId={selectedUserId}
              userName={selectedUserName}
              userStatus={selectedUserStatus}
              onClose={handleSuspensionDialogClose}
              onSuccess={handleSuccess}
            />
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
