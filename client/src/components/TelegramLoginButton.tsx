import { useEffect, useRef } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginButtonProps {
  botName: string;
  buttonSize?: 'large' | 'medium' | 'small';
  cornerRadius?: number;
  requestAccess?: boolean;
  usePic?: boolean;
  onAuth: (user: TelegramUser) => void;
  className?: string;
}

declare global {
  interface Window {
    TelegramLoginWidget?: {
      dataOnauth?: (user: TelegramUser) => void;
    };
  }
}

export function TelegramLoginButton({
  botName,
  buttonSize = 'large',
  cornerRadius,
  requestAccess = true,
  usePic = false,
  onAuth,
  className = '',
}: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set up global callback
    const callbackName = `telegramCallback_${Date.now()}`;
    (window as any)[callbackName] = (user: TelegramUser) => {
      onAuth(user);
    };

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', buttonSize);
    if (cornerRadius !== undefined) {
      script.setAttribute('data-radius', cornerRadius.toString());
    }
    script.setAttribute('data-request-access', requestAccess ? 'write' : '');
    script.setAttribute('data-userpic', usePic.toString());
    script.setAttribute('data-onauth', `${callbackName}(user)`);
    script.async = true;

    // Append to container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(script);
    }

    // Cleanup
    return () => {
      delete (window as any)[callbackName];
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [botName, buttonSize, cornerRadius, requestAccess, usePic, onAuth]);

  return <div ref={containerRef} className={className} />;
}
