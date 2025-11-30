import { useState } from 'react';
import { useLocation } from 'wouter';
import Login from '@/components/Login';
import Register from '@/components/Register';

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);

  const handleLoginSuccess = (user: any) => {
    // Redirect to dashboard
    setLocation('/');
  };

  const handleRegisterSuccess = () => {
    // Switch to login after successful registration
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {isLogin ? (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setIsLogin(false)}
        />
      ) : (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </div>
  );
}
