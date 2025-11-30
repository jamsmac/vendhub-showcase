import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationPreferences } from '@/components/NotificationPreferences';
import { Bell, User, Lock } from 'lucide-react';

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState('notifications');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Параметры пользователя
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Управляйте своими предпочтениями и настройками оповещений
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Оповещения</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Профиль</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Безопасность</span>
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
                Параметры оповещений
              </h2>
              <NotificationPreferences />
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
                Информация профиля
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Функция управления профилем будет добавлена в будущем обновлении.
              </p>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
                Параметры безопасности
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Функция управления безопасностью будет добавлена в будущем обновлении.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
