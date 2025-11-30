import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface SuspensionDialogProps {
  open: boolean;
  userId: number;
  userName: string;
  userStatus: 'active' | 'suspended' | 'inactive';
  onClose: () => void;
  onSuccess?: () => void;
}

export function SuspensionDialog({
  open,
  userId,
  userName,
  userStatus,
  onClose,
  onSuccess,
}: SuspensionDialogProps) {
  const [reason, setReason] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const suspendMutation = trpc.userManagement.suspendUser.useMutation();
  const reactivateMutation = trpc.userManagement.reactivateUser.useMutation();

  const isSuspended = userStatus === 'suspended';

  const handleSuspend = async () => {
    if (!reason.trim()) {
      toast.error('Пожалуйста, укажите причину блокировки');
      return;
    }

    try {
      await suspendMutation.mutateAsync({
        userId,
        reason,
      });

      toast.success(`Пользователь ${userName} успешно заблокирован`);
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при блокировке пользователя');
    }
  };

  const handleReactivate = async () => {
    try {
      await reactivateMutation.mutateAsync({
        userId,
      });

      toast.success(`Пользователь ${userName} успешно разблокирован`);
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при разблокировке пользователя');
    }
  };

  const handleClose = () => {
    setReason('');
    setShowConfirm(false);
    onClose();
  };

  if (isSuspended) {
    // Reactivation dialog
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Разблокировка пользователя</DialogTitle>
            <DialogDescription className="text-slate-400">
              Вы собираетесь разблокировать пользователя {userName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Warning */}
            <div className="p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-200">
                Пользователь получит доступ ко всем своим функциям после разблокировки.
              </p>
            </div>

            {/* User Info */}
            <div className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
              <p className="text-sm text-slate-400">Пользователь</p>
              <p className="text-white font-medium">{userName}</p>
            </div>
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
              onClick={handleReactivate}
              disabled={reactivateMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {reactivateMutation.isPending ? 'Разблокировка...' : 'Разблокировать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Suspension dialog
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        {!showConfirm ? (
          <>
            <DialogHeader>
              <DialogTitle>Блокировка пользователя</DialogTitle>
              <DialogDescription className="text-slate-400">
                Блокировка пользователя {userName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Warning */}
              <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">
                  Заблокированный пользователь не сможет получить доступ к системе до разблокировки.
                </p>
              </div>

              {/* Reason */}
              <div>
                <Label htmlFor="suspension-reason" className="text-slate-300 mb-2 block">
                  Причина блокировки *
                </Label>
                <Textarea
                  id="suspension-reason"
                  placeholder="Укажите причину блокировки этого пользователя..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Эта информация будет сохранена в журнале аудита
                </p>
              </div>

              {/* Suspension Effects */}
              <div className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                <p className="text-sm font-medium text-slate-300 mb-2">Последствия блокировки:</p>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Пользователь не сможет войти в систему</li>
                  <li>• Все активные сессии будут завершены</li>
                  <li>• Доступ к API будет заблокирован</li>
                  <li>• Действие будет записано в журнал аудита</li>
                </ul>
              </div>
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
                disabled={!reason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Далее
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Подтверждение блокировки</DialogTitle>
              <DialogDescription className="text-slate-400">
                Пожалуйста, подтвердите блокировку пользователя
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Confirmation Summary */}
              <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-slate-400">Пользователь</p>
                  <p className="text-white font-medium">{userName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Причина блокировки</p>
                  <p className="text-white mt-1">{reason}</p>
                </div>
              </div>

              {/* Critical Warning */}
              <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">
                  Это действие нельзя отменить автоматически. Пользователя можно разблокировать только вручную администратором.
                </p>
              </div>

              {/* Audit Log Notice */}
              <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg flex gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-200">
                  Это действие будет записано в журнал аудита с вашим именем и временем.
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
                onClick={handleSuspend}
                disabled={suspendMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {suspendMutation.isPending ? 'Блокировка...' : 'Подтвердить блокировку'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
