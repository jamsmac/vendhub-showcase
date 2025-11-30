import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Lock, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface PasswordRecoveryProps {
  onBackToLogin?: () => void;
}

type RecoveryStep = 'request' | 'verify' | 'reset' | 'success';

export default function PasswordRecovery({ onBackToLogin }: PasswordRecoveryProps) {
  const [step, setStep] = useState<RecoveryStep>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetData, setResetData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const requestResetMutation = trpc.passwordRecovery.requestReset.useMutation();
  const verifyTokenMutation = trpc.passwordRecovery.verifyToken.useMutation();
  const resetPasswordMutation = trpc.passwordRecovery.resetPassword.useMutation();
  const resendEmailMutation = trpc.passwordRecovery.resendResetEmail.useMutation();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.includes('@')) {
      toast.error('Пожалуйста, введите корректный email');
      return;
    }

    try {
      await requestResetMutation.mutateAsync({ email });
      toast.success('Письмо с ссылкой восстановления отправлено на ваш email');
      setStep('verify');
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при отправке письма');
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      toast.error('Пожалуйста, введите код восстановления');
      return;
    }

    try {
      const result = await verifyTokenMutation.mutateAsync({ token });
      if (result.valid) {
        setStep('reset');
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Неверный код восстановления');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (resetData.newPassword !== resetData.confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    if (resetData.newPassword.length < 8) {
      toast.error('Пароль должен содержать минимум 8 символов');
      return;
    }

    try {
      const result = await resetPasswordMutation.mutateAsync({
        token,
        newPassword: resetData.newPassword,
        confirmPassword: resetData.confirmPassword,
      });

      if (result.success) {
        toast.success('Пароль успешно изменен!');
        setStep('success');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при изменении пароля');
    }
  };

  const handleResendEmail = async () => {
    try {
      await resendEmailMutation.mutateAsync({ email });
      toast.success('Письмо повторно отправлено на ваш email');
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при отправке письма');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Восстановление пароля</h1>
          <p className="text-slate-400">Восстановите доступ к вашему аккаунту</p>
        </div>

        <Card className="p-8 bg-slate-800 border-slate-700 mb-6">
          {/* Step 1: Request Reset */}
          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email адрес
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={requestResetMutation.isPending}
                />
              </div>

              <p className="text-sm text-slate-400">
                Введите email адрес, связанный с вашим аккаунтом. Мы отправим вам ссылку для восстановления пароля.
              </p>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
                disabled={requestResetMutation.isPending}
              >
                {requestResetMutation.isPending ? 'Отправка...' : 'Отправить ссылку'}
              </Button>
            </form>
          )}

          {/* Step 2: Verify Token */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyToken} className="space-y-4">
              <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg mb-4">
                <p className="text-sm text-blue-200">
                  Письмо отправлено на <strong>{email}</strong>. Скопируйте код из письма и вставьте его ниже.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Код восстановления
                </label>
                <Input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Вставьте код из письма"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 font-mono"
                  disabled={verifyTokenMutation.isPending}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
                disabled={verifyTokenMutation.isPending}
              >
                {verifyTokenMutation.isPending ? 'Проверка...' : 'Проверить код'}
              </Button>

              <button
                type="button"
                onClick={handleResendEmail}
                className="w-full text-sm text-blue-400 hover:underline"
              >
                Не получили письмо? Отправить еще раз
              </button>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Lock className="inline w-4 h-4 mr-2" />
                  Новый пароль
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={resetData.newPassword}
                    onChange={(e) =>
                      setResetData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Введите новый пароль"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                    disabled={resetPasswordMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Lock className="inline w-4 h-4 mr-2" />
                  Подтвердите пароль
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={resetData.confirmPassword}
                    onChange={(e) =>
                      setResetData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Повторите пароль"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                    disabled={resetPasswordMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? 'Изменение...' : 'Изменить пароль'}
              </Button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Пароль изменен!</h3>
              <p className="text-slate-400">
                Ваш пароль успешно изменен. Теперь вы можете войти в систему с новым паролем.
              </p>
              <Button
                onClick={onBackToLogin}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2"
              >
                Вернуться к входу
              </Button>
            </div>
          )}
        </Card>

        {/* Back to Login */}
        {step !== 'success' && (
          <button
            onClick={onBackToLogin}
            className="flex items-center justify-center w-full text-blue-400 hover:text-blue-300 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к входу
          </button>
        )}
      </div>
    </div>
  );
}
