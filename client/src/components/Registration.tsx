import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Mail, Lock, User, Briefcase, Phone, MapPin } from 'lucide-react';

interface RegistrationProps {
  onRegistrationComplete?: () => void;
  onSwitchToLogin?: () => void;
}

const ROLES = [
  { id: 'operator', label: 'Оператор', description: 'Исполнитель задач' },
  { id: 'supervisor', label: 'Старший оператор', description: 'Руководитель операторов' },
  { id: 'manager', label: 'Менеджер', description: 'Управление отделом' },
  { id: 'franchisee', label: 'Франчайзи', description: 'Бизнес-партнёр' },
  { id: 'partner', label: 'Партнёр', description: 'Внешний наблюдатель' },
];

export default function Registration({ onRegistrationComplete, onSwitchToLogin }: RegistrationProps) {
  const [step, setStep] = useState<'role-selection' | 'form'>('role-selection');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: '',
  });

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setStep('form');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Пожалуйста, введите полное имя');
      return false;
    }
    if (!formData.email.includes('@')) {
      toast.error('Пожалуйста, введите корректный email');
      return false;
    }
    if (formData.password.length < 8) {
      toast.error('Пароль должен содержать минимум 8 символов');
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

    setIsLoading(true);
    try {
      // TODO: Connect to tRPC endpoint for registration
      // const result = await trpc.auth.register.mutate({
      //   fullName: formData.fullName,
      //   email: formData.email,
      //   phone: formData.phone,
      //   location: formData.location,
      //   password: formData.password,
      //   requestedRole: selectedRole,
      // });

      toast.success('Заявка отправлена! Ожидайте одобрения администратором.');
      onRegistrationComplete?.();
    } catch (error) {
      toast.error('Ошибка при регистрации. Попробуйте позже.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Role Selection
  if (step === 'role-selection') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">VendHub Manager</h1>
            <p className="text-slate-400">Система управления торговыми автоматами</p>
          </div>

          {/* Role Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Выберите вашу роль</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ROLES.map(role => (
                <Card
                  key={role.id}
                  className="p-6 cursor-pointer hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20"
                  onClick={() => handleRoleSelect(role.id)}
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{role.label}</h3>
                  <p className="text-sm text-slate-400">{role.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-slate-400 mb-2">Уже есть аккаунт?</p>
            <Button
              variant="outline"
              className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
              onClick={onSwitchToLogin}
            >
              Войти в систему
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Registration Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Регистрация</h2>
          <p className="text-slate-400">Роль: <span className="text-blue-400 font-semibold">{ROLES.find(r => r.id === selectedRole)?.label}</span></p>
        </div>

        {/* Form */}
        <Card className="p-8 bg-slate-800 border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <User className="inline w-4 h-4 mr-2" />
                Полное имя
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
                placeholder="ivan@example.com"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                disabled={isLoading}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Phone className="inline w-4 h-4 mr-2" />
                Телефон (опционально)
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+998 90 123 45 67"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                disabled={isLoading}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <MapPin className="inline w-4 h-4 mr-2" />
                Местоположение (опционально)
              </label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ташкент, Узбекистан"
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
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Минимум 8 символов"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                disabled={isLoading}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                Подтвердите пароль
              </label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Повторите пароль"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                disabled={isLoading}
              />
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-2 text-sm text-slate-400">
              <input
                type="checkbox"
                id="terms"
                className="mt-1"
                disabled={isLoading}
              />
              <label htmlFor="terms">
                Я согласен с условиями использования и политикой конфиденциальности
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
              disabled={isLoading}
            >
              {isLoading ? 'Отправка...' : 'Отправить заявку'}
            </Button>

            {/* Back Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full text-slate-400 border-slate-600 hover:bg-slate-700"
              onClick={() => setStep('role-selection')}
              disabled={isLoading}
            >
              Назад
            </Button>
          </form>
        </Card>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">Уже есть аккаунт? <button onClick={onSwitchToLogin} className="text-blue-400 hover:underline">Войти</button></p>
        </div>
      </div>
    </div>
  );
}
