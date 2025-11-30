import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Lock, User, Briefcase, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface RegisterProps {
  onRegisterSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function Register({ onRegisterSuccess, onSwitchToLogin }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const registerMutation = trpc.auth.register.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Validate password strength in real-time
    if (name === 'password') {
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

    setPasswordErrors(errors);
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Пожалуйста, введите ФИО');
      return false;
    }
    if (!formData.email.includes('@')) {
      toast.error('Пожалуйста, введите корректный email');
      return false;
    }
    if (passwordErrors.length > 0) {
      toast.error('Пароль не соответствует требованиям');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Пароли не совпадают');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const result = await registerMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        fullName: formData.fullName,
      });

      if (result.success) {
        toast.success('Регистрация успешна! Пожалуйста, войдите в систему.');
        onRegisterSuccess?.();
      }
    } catch (error: any) {
      const message = error?.message || 'Ошибка при регистрации';
      toast.error(message);
      console.error(error);
    }
  };

  const isLoading = registerMutation.isPending;
  const isPasswordValid = passwordErrors.length === 0 && formData.password.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 mb-4">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">VendHub Manager</h1>
          <p className="text-slate-400">Создание аккаунта</p>
        </div>

        {/* Form */}
        <Card className="p-8 bg-slate-800 border-slate-700 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <User className="inline w-4 h-4 mr-2" />
                ФИО
              </label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Иван Иванов"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                Пароль
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Введите пароль"
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
              {formData.password && (
                <div className="mt-3 p-3 bg-slate-700/50 rounded border border-slate-600">
                  {passwordErrors.length === 0 ? (
                    <p className="text-sm text-green-400 flex items-center">
                      ✓ Пароль соответствует требованиям
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
                <p className={`text-sm mt-2 ${formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                  {formData.password === formData.confirmPassword ? '✓ Пароли совпадают' : '✗ Пароли не совпадают'}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 mt-6"
              disabled={isLoading || passwordErrors.length > 0}
            >
              {isLoading ? 'Создание аккаунта...' : 'Создать аккаунт'}
            </Button>
          </form>
        </Card>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-slate-400 mb-4">Уже есть аккаунт?</p>
          <Button
            variant="outline"
            className="w-full text-green-400 border-green-400 hover:bg-green-400/10"
            onClick={onSwitchToLogin}
          >
            Войти в систему
          </Button>
        </div>
      </div>
    </div>
  );
}
