import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle2, Lock, User, Shield, ArrowRight } from 'lucide-react';

interface OnboardingWizardProps {
  userEmail: string;
  onOnboardingComplete?: () => void;
}

type OnboardingStep = 'password-change' | 'profile' | 'security' | 'complete';

export default function OnboardingWizard({ userEmail, onOnboardingComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('password-change');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Password Change
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    // Profile
    fullName: '',
    phone: '',
    // Security
    enable2FA: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword.length < 8) {
      toast.error('Новый пароль должен содержать минимум 8 символов');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Connect to tRPC endpoint
      toast.success('Пароль успешно изменён');
      setCurrentStep('profile');
    } catch (error) {
      toast.error('Ошибка при изменении пароля');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      toast.error('Пожалуйста, введите полное имя');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Connect to tRPC endpoint
      toast.success('Профиль обновлён');
      setCurrentStep('security');
    } catch (error) {
      toast.error('Ошибка при обновлении профиля');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecuritySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      // TODO: Connect to tRPC endpoint
      toast.success('Настройки безопасности сохранены');
      setCurrentStep('complete');
    } catch (error) {
      toast.error('Ошибка при сохранении настроек');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onOnboardingComplete?.();
  };

  // Step 1: Password Change
  if (currentStep === 'password-change') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="w-full max-w-md">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                <span className="text-slate-300 text-sm">Пароль</span>
              </div>
              <div className="flex-1 h-1 bg-slate-700 mx-2"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-sm font-bold">2</div>
                <span className="text-slate-400 text-sm">Профиль</span>
              </div>
              <div className="flex-1 h-1 bg-slate-700 mx-2"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-sm font-bold">3</div>
                <span className="text-slate-400 text-sm">Безопасность</span>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Смена пароля</h1>
            <p className="text-slate-400">Создайте надёжный пароль для вашего аккаунта</p>
          </div>

          {/* Form */}
          <Card className="p-8 bg-slate-800 border-slate-700 mb-6">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Текущий пароль
                </label>
                <Input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Введите текущий пароль"
                  className="bg-slate-700 border-slate-600 text-white"
                  disabled={isLoading}
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Новый пароль
                </label>
                <Input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Минимум 8 символов"
                  className="bg-slate-700 border-slate-600 text-white"
                  disabled={isLoading}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Подтвердите пароль
                </label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Повторите пароль"
                  className="bg-slate-700 border-slate-600 text-white"
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'Сохранение...' : 'Далее'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // Step 2: Profile
  if (currentStep === 'profile') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="w-full max-w-md">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <span className="text-slate-300 text-sm">Пароль</span>
              </div>
              <div className="flex-1 h-1 bg-blue-600 mx-2"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                <span className="text-slate-300 text-sm">Профиль</span>
              </div>
              <div className="flex-1 h-1 bg-slate-700 mx-2"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-sm font-bold">3</div>
                <span className="text-slate-400 text-sm">Безопасность</span>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <User className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Заполните профиль</h1>
            <p className="text-slate-400">Добавьте информацию о себе</p>
          </div>

          {/* Form */}
          <Card className="p-8 bg-slate-800 border-slate-700 mb-6">
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Полное имя
                </label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Иван Иванов"
                  className="bg-slate-700 border-slate-600 text-white"
                  disabled={isLoading}
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={userEmail}
                  disabled
                  className="bg-slate-700 border-slate-600 text-slate-400"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Телефон (опционально)
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+998 90 123 45 67"
                  className="bg-slate-700 border-slate-600 text-white"
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'Сохранение...' : 'Далее'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // Step 3: Security
  if (currentStep === 'security') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="w-full max-w-md">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <span className="text-slate-300 text-sm">Пароль</span>
              </div>
              <div className="flex-1 h-1 bg-blue-600 mx-2"></div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <span className="text-slate-300 text-sm">Профиль</span>
              </div>
              <div className="flex-1 h-1 bg-blue-600 mx-2"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">3</div>
                <span className="text-slate-300 text-sm">Безопасность</span>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Безопасность</h1>
            <p className="text-slate-400">Настройте двухфакторную аутентификацию</p>
          </div>

          {/* Form */}
          <Card className="p-8 bg-slate-800 border-slate-700 mb-6">
            <form onSubmit={handleSecuritySetup} className="space-y-4">
              {/* 2FA Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <h3 className="text-white font-semibold">Двухфакторная аутентификация</h3>
                  <p className="text-sm text-slate-400 mt-1">Повысьте безопасность вашего аккаунта</p>
                </div>
                <input
                  type="checkbox"
                  name="enable2FA"
                  checked={formData.enable2FA}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded"
                  disabled={isLoading}
                />
              </div>

              {/* Info */}
              <div className="p-4 bg-blue-600/20 border border-blue-600/50 rounded-lg">
                <p className="text-sm text-blue-300">
                  2FA требуется для администраторов и владельца. Вы можете настроить её позже в параметрах безопасности.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'Завершение...' : 'Завершить'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // Step 4: Complete
  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="w-full max-w-md text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-600/20 border border-green-600 mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Добро пожаловать!</h1>
            <p className="text-slate-400">Ваш аккаунт готов к использованию</p>
          </div>

          {/* Info Cards */}
          <div className="space-y-4 mb-8">
            <Card className="p-4 bg-slate-800 border-slate-700 text-left">
              <h3 className="text-white font-semibold mb-2">Что дальше?</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>✓ Заполните свой профиль</li>
                <li>✓ Ознакомьтесь с документацией</li>
                <li>✓ Начните работать с системой</li>
              </ul>
            </Card>
          </div>

          {/* Complete Button */}
          <Button
            onClick={handleComplete}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
          >
            Перейти в систему
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
