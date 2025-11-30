import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Lock, Briefcase, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLoginSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export default function Login({ onLoginSuccess, onSwitchToRegister }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.email.includes('@')) {
      toast.error('Пожалуйста, введите корректный email');
      return false;
    }
    if (!formData.password) {
      toast.error('Пожалуйста, введите пароль');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // TODO: Connect to tRPC endpoint for login
      // const result = await trpc.auth.login.mutate({
      //   email: formData.email,
      //   password: formData.password,
      // });

      toast.success('Вход выполнен успешно!');
      onLoginSuccess?.();
    } catch (error) {
      toast.error('Неверный email или пароль');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-4">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">VendHub Manager</h1>
          <p className="text-slate-400">Вход в систему</p>
        </div>

        {/* Form */}
        <Card className="p-8 bg-slate-800 border-slate-700 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="rounded"
                disabled={isLoading}
              />
              <label htmlFor="rememberMe" className="text-sm text-slate-400">
                Запомнить меня
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          {/* Forgot Password */}
          <div className="text-center mt-4">
            <button className="text-sm text-blue-400 hover:underline">
              Забыли пароль?
            </button>
          </div>
        </Card>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-slate-400 mb-4">Нет аккаунта?</p>
          <Button
            variant="outline"
            className="w-full text-blue-400 border-blue-400 hover:bg-blue-400/10"
            onClick={onSwitchToRegister}
          >
            Создать новый аккаунт
          </Button>
        </div>

        {/* Demo Info */}
        <div className="mt-8 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <p className="text-xs text-slate-400 text-center">
            Демо учётные данные:
            <br />
            Email: <span className="text-slate-300">demo@vendhub.com</span>
            <br />
            Пароль: <span className="text-slate-300">Demo123!</span>
          </p>
        </div>
      </div>
    </div>
  );
}
