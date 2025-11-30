import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle } from 'lucide-react';

type UserRole = 'user' | 'operator' | 'manager' | 'admin';

interface RoleAssignmentDialogProps {
  open: boolean;
  userId: number;
  userName: string;
  currentRole: UserRole;
  onClose: () => void;
  onSuccess?: () => void;
}

const roleDescriptions: Record<UserRole, string> = {
  user: 'Базовый пользователь с доступом только к собственному профилю',
  operator: 'Оператор может просматривать и обновлять машины и инвентарь',
  manager: 'Менеджер может создавать, обновлять и удалять ресурсы в своем регионе',
  admin: 'Администратор имеет полный доступ ко всем функциям системы',
};

export function RoleAssignmentDialog({
  open,
  userId,
  userName,
  currentRole,
  onClose,
  onSuccess,
}: RoleAssignmentDialogProps) {
  const [newRole, setNewRole] = useState<UserRole>(currentRole);
  const [reason, setReason] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const updateRoleMutation = trpc.userManagement.updateRole.useMutation();

  const handleSubmit = async () => {
    if (newRole === currentRole) {
      toast.error('Выберите другую роль');
      return;
    }

    try {
      await updateRoleMutation.mutateAsync({
        userId,
        newRole,
        reason: reason || undefined,
      });

      toast.success(`Роль пользователя ${userName} успешно изменена на ${getRoleLabel(newRole)}`);
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при изменении роли');
    }
  };

  const handleClose = () => {
    setNewRole(currentRole);
    setReason('');
    setShowConfirm(false);
    onClose();
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'manager':
        return 'Менеджер';
      case 'operator':
        return 'Оператор';
      default:
        return 'Пользователь';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'operator':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        {!showConfirm ? (
          <>
            <DialogHeader>
              <DialogTitle>Изменение роли пользователя</DialogTitle>
              <DialogDescription className="text-slate-400">
                Измените роль для {userName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Current Role */}
              <div>
                <Label className="text-slate-300 mb-2 block">Текущая роль</Label>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(
                    currentRole
                  )}`}
                >
                  {getRoleLabel(currentRole)}
                </div>
              </div>

              {/* New Role Selection */}
              <div>
                <Label htmlFor="new-role" className="text-slate-300 mb-2 block">
                  Новая роль
                </Label>
                <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                  <SelectTrigger
                    id="new-role"
                    className="bg-slate-700 border-slate-600 text-white"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="user">Пользователь</SelectItem>
                    <SelectItem value="operator">Оператор</SelectItem>
                    <SelectItem value="manager">Менеджер</SelectItem>
                    <SelectItem value="admin">Администратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Role Description */}
              {newRole && (
                <div className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                  <p className="text-sm text-slate-300">{roleDescriptions[newRole]}</p>
                </div>
              )}

              {/* Reason */}
              <div>
                <Label htmlFor="reason" className="text-slate-300 mb-2 block">
                  Причина изменения (опционально)
                </Label>
                <Input
                  id="reason"
                  placeholder="Введите причину..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Warning */}
              {newRole === 'admin' && (
                <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">
                    Администраторы имеют полный доступ к системе. Будьте осторожны при назначении этой роли.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Отмена
              </Button>
              <Button
                onClick={() => setShowConfirm(true)}
                disabled={newRole === currentRole}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Далее
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Подтверждение изменения роли</DialogTitle>
              <DialogDescription className="text-slate-400">
                Пожалуйста, подтвердите изменение
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Confirmation Summary */}
              <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-slate-400">Пользователь</p>
                  <p className="text-white font-medium">{userName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm text-slate-400">Текущая роль</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleBadgeColor(
                        currentRole
                      )}`}
                    >
                      {getRoleLabel(currentRole)}
                    </span>
                  </div>
                  <div className="text-slate-400">→</div>
                  <div>
                    <p className="text-sm text-slate-400">Новая роль</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleBadgeColor(
                        newRole
                      )}`}
                    >
                      {getRoleLabel(newRole)}
                    </span>
                  </div>
                </div>
                {reason && (
                  <div>
                    <p className="text-sm text-slate-400">Причина</p>
                    <p className="text-white">{reason}</p>
                  </div>
                )}
              </div>

              {/* Success Message */}
              <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg flex gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-200">
                  Это действие будет записано в журнал аудита.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Назад
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={updateRoleMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {updateRoleMutation.isPending ? 'Изменение...' : 'Подтвердить'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
