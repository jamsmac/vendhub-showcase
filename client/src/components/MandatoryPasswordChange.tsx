import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface MandatoryPasswordChangeProps {
  userEmail: string;
  onPasswordChangeComplete?: () => void;
}

export default function MandatoryPasswordChange({ 
  userEmail, 
  onPasswordChangeComplete 
}: MandatoryPasswordChangeProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const changePasswordMutation = trpc.auth.changePassword.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Validate password strength in real-time
    if (name === 'newPassword') {
      validatePasswordStrength(value);
    }
  };

  const validatePasswordStrength = (password: string) => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Минимум 8 символов');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Минимум одна заглавная буква');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Минимум одна строчная буква');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Минимум одна цифра');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Минимум один спецсимвол (!@#$%^&*)');
    }

    setPasswordErrors(errors);
  };

  const validateForm = () => {
    if (!formData.currentPassword.trim()) {
      toast.error('Пожалуйста, введите текущий пароль');
      return false;
    }
    if (passwordErrors.length > 0) {
      toast.error('Новый пароль не соответствует требованиям');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Пароли не совпадают');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const result = await changePasswordMutation.mutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (result.success) {
        toast.success('Пароль успешно изменён!');
        onPasswordChangeComplete?.();
      }
    } catch (error: any) {
      const message = error?.message || 'Ошибка при изменении пароля';
      toast.error(message);
      console.error(error);
    }
  };

  const isLoading = changePasswordMutation.isPending;
  const isPasswordValid = passwordErrors.length === 0 && formData.newPassword.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Смена пароля</h1>
          <p className="text-slate-400">
            Для безопасности вашего аккаунта требуется установить новый пароль
          </p>
        </div>

        {/* Alert */}
        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-400">Обязательное действие</p>
              <p className="text-sm text-orange-300/80 mt-1">
                Вы не сможете продолжить работу в системе, пока не установите новый пароль
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="p-8 bg-slate-800 border-slate-700 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                Текущий пароль
              </label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Введите текущий пароль"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                Новый пароль
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Введите новый пароль"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-3 p-3 bg-slate-700/50 rounded border border-slate-600">
                  {passwordErrors.length === 0 ? (
                    <p className="text-sm text-green-400 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Пароль соответствует требованиям
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {passwordErrors.map((error, idx) => (
                        <p key={idx} className="text-sm text-orange-400 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-2" />
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                Подтвердите пароль
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Повторите пароль"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <p className={`text-sm mt-2 ${formData.newPassword === formData.confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                  {formData.newPassword === formData.confirmPassword ? '✓ Пароли совпадают' : '✗ Пароли не совпадают'}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 mt-6"
              disabled={isLoading || passwordErrors.length > 0 || !isPasswordValid}
            >
              {isLoading ? 'Изменение пароля...' : 'Изменить пароль и продолжить'}
            </Button>
          </form>
        </Card>

        {/* Requirements Info */}
        <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <p className="text-xs text-slate-400 font-medium mb-2">Требования к паролю:</p>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>✓ Минимум 8 символов</li>
            <li>✓ Минимум одна заглавная буква (A-Z)</li>
            <li>✓ Минимум одна строчная буква (a-z)</li>
            <li>✓ Минимум одна цифра (0-9)</li>
            <li>✓ Минимум один спецсимвол (!@#$%^&*)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
