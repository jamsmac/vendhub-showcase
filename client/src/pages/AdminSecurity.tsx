import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecurityDashboard } from '@/components/admin/SecurityDashboard';
import { ActivityLogViewer } from '@/components/admin/ActivityLogViewer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
	Shield,
	AlertTriangle,
	Activity,
	Lock,
	Eye,
	RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSecurity() {
	const [refreshKey, setRefreshKey] = useState(0);

	const handleRefresh = () => {
		setRefreshKey((prev) => prev + 1);
		toast.success('Данные обновлены');
	};

	return (
		<ProtectedRoute requiredRole="admin">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-white">Безопасность и мониторинг</h1>
						<p className="text-slate-400 mt-1">
							Отслеживание действий пользователей, обнаружение подозрительной активности и аналитика
						</p>
					</div>
					<Button
						onClick={handleRefresh}
						className="bg-blue-600 hover:bg-blue-700 text-white"
					>
						<RefreshCw className="w-4 h-4 mr-2" />
						Обновить
					</Button>
				</div>

				{/* Main Content */}
				<Tabs defaultValue="dashboard" className="w-full">
					<TabsList className="bg-slate-800 border-b border-slate-700">
						<TabsTrigger value="dashboard" className="text-slate-300 data-[state=active]:text-white">
							<Shield className="w-4 h-4 mr-2" />
							Панель безопасности
						</TabsTrigger>
						<TabsTrigger value="activity" className="text-slate-300 data-[state=active]:text-white">
							<Activity className="w-4 h-4 mr-2" />
							Журнал активности
						</TabsTrigger>
						<TabsTrigger value="sessions" className="text-slate-300 data-[state=active]:text-white">
							<Lock className="w-4 h-4 mr-2" />
							Сессии
						</TabsTrigger>
						<TabsTrigger value="guide" className="text-slate-300 data-[state=active]:text-white">
							<Eye className="w-4 h-4 mr-2" />
							Руководство
						</TabsTrigger>
					</TabsList>

					{/* Security Dashboard Tab */}
					<TabsContent value="dashboard" className="space-y-4">
						<SecurityDashboard key={refreshKey} />
					</TabsContent>

					{/* Activity Log Tab */}
					<TabsContent value="activity" className="space-y-4">
						<ActivityLogViewer adminOnly={true} />
					</TabsContent>

					{/* Sessions Tab */}
					<TabsContent value="sessions" className="space-y-4">
						<Card className="p-6 bg-slate-800 border-slate-700">
							<div className="space-y-4">
								<div>
									<h3 className="text-lg font-semibold text-white mb-2">
										Управление сессиями
									</h3>
									<p className="text-slate-400 text-sm">
										Просмотр и управление активными сессиями пользователей
									</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* Session Info */}
									<Card className="p-4 bg-slate-700/50 border-slate-600">
										<h4 className="text-white font-medium mb-3">Информация о сессии</h4>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-slate-400">Максимальное время жизни:</span>
												<span className="text-white">24 часа</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-400">Время неактивности:</span>
												<span className="text-white">30 минут</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-400">Одновременные сессии:</span>
												<span className="text-white">До 3 на пользователя</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-400">Требуется 2FA:</span>
												<span className="text-white">Для администраторов</span>
											</div>
										</div>
									</Card>

									{/* Security Recommendations */}
									<Card className="p-4 bg-slate-700/50 border-slate-600">
										<h4 className="text-white font-medium mb-3">Рекомендации</h4>
										<ul className="space-y-2 text-sm">
											<li className="flex items-start gap-2">
												<span className="text-green-500 mt-0.5">✓</span>
												<span className="text-slate-300">Регулярно проверяйте подозрительную активность</span>
											</li>
											<li className="flex items-start gap-2">
												<span className="text-green-500 mt-0.5">✓</span>
												<span className="text-slate-300">Блокируйте аккаунты с множественными неудачными попытками входа</span>
											</li>
											<li className="flex items-start gap-2">
												<span className="text-green-500 mt-0.5">✓</span>
												<span className="text-slate-300">Требуйте 2FA для администраторов</span>
											</li>
											<li className="flex items-start gap-2">
												<span className="text-green-500 mt-0.5">✓</span>
												<span className="text-slate-300">Экспортируйте логи для архивирования</span>
											</li>
										</ul>
									</Card>
								</div>
							</div>
						</Card>
					</TabsContent>

					{/* Guide Tab */}
					<TabsContent value="guide" className="space-y-4">
						<Card className="p-6 bg-slate-800 border-slate-700">
							<div className="space-y-6">
								<div>
									<h3 className="text-lg font-semibold text-white mb-3">
										Руководство по мониторингу безопасности
									</h3>
									<p className="text-slate-400 text-sm mb-4">
										Система отслеживает все действия пользователей для обеспечения безопасности и соответствия требованиям.
									</p>
								</div>

								{/* What's Logged */}
								<div>
									<h4 className="text-white font-medium mb-3 flex items-center gap-2">
										<Activity className="w-4 h-4" />
										Что отслеживается
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
											<p className="text-white font-medium text-sm mb-2">Попытки входа</p>
											<ul className="text-slate-400 text-sm space-y-1">
												<li>• Успешные входы</li>
												<li>• Неудачные попытки</li>
												<li>• Блокировки аккаунтов</li>
												<li>• IP адреса</li>
											</ul>
										</div>
										<div className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
											<p className="text-white font-medium text-sm mb-2">API вызовы</p>
											<ul className="text-slate-400 text-sm space-y-1">
												<li>• Endpoint и метод</li>
												<li>• Статус ответа</li>
												<li>• Время выполнения</li>
												<li>• IP адрес клиента</li>
											</ul>
										</div>
										<div className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
											<p className="text-white font-medium text-sm mb-2">Доступ к данным</p>
											<ul className="text-slate-400 text-sm space-y-1">
												<li>• Просмотр данных</li>
												<li>• Создание записей</li>
												<li>• Обновление данных</li>
												<li>• Экспорт информации</li>
											</ul>
										</div>
										<div className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
											<p className="text-white font-medium text-sm mb-2">Администрирование</p>
											<ul className="text-slate-400 text-sm space-y-1">
												<li>• Смена ролей пользователей</li>
												<li>• Блокировка аккаунтов</li>
												<li>• Изменение прав доступа</li>
												<li>• Удаление данных</li>
											</ul>
										</div>
									</div>
								</div>

								{/* Suspicious Activity Types */}
								<div>
									<h4 className="text-white font-medium mb-3 flex items-center gap-2">
										<AlertTriangle className="w-4 h-4" />
										Типы подозрительной активности
									</h4>
									<div className="space-y-2">
										{[
											{
												type: 'Множественные неудачные входы',
												description: 'Более 3 неудачных попыток входа в течение часа',
											},
											{
												type: 'Превышение лимита API',
												description: 'Более 100 запросов в минуту с одного IP адреса',
											},
											{
												type: 'Массовый доступ к данным',
												description: 'Доступ к чувствительным данным в необычном объеме',
											},
											{
												type: 'Попытка повышения привилегий',
												description: 'Попытка получить роль выше текущей',
											},
											{
												type: 'Экспорт данных',
												description: 'Экспорт больших объемов данных',
											},
										].map((item, idx) => (
											<div
												key={idx}
												className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg"
											>
												<p className="text-white font-medium text-sm">
													{item.type}
												</p>
												<p className="text-slate-400 text-sm">
													{item.description}
												</p>
											</div>
										))}
									</div>
								</div>

								{/* Best Practices */}
								<div>
									<h4 className="text-white font-medium mb-3">Лучшие практики</h4>
									<ul className="space-y-2 text-slate-400 text-sm">
										<li className="flex items-start gap-2">
											<span className="text-blue-500 mt-0.5">→</span>
											<span>Проверяйте журнал активности не менее раза в неделю</span>
										</li>
										<li className="flex items-start gap-2">
											<span className="text-blue-500 mt-0.5">→</span>
											<span>Немедленно реагируйте на критические предупреждения</span>
										</li>
										<li className="flex items-start gap-2">
											<span className="text-blue-500 mt-0.5">→</span>
											<span>Архивируйте логи ежемесячно для соответствия требованиям</span>
										</li>
										<li className="flex items-start gap-2">
											<span className="text-blue-500 mt-0.5">→</span>
											<span>Обучайте пользователей о безопасности и фишинге</span>
										</li>
										<li className="flex items-start gap-2">
											<span className="text-blue-500 mt-0.5">→</span>
											<span>Используйте 2FA для всех администраторов</span>
										</li>
									</ul>
								</div>
							</div>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</ProtectedRoute>
	);
}
