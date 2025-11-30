import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	AlertTriangle,
	Shield,
	AlertCircle,
	TrendingUp,
	Lock,
	Eye,
	CheckCircle,
	Clock,
	ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

export function SecurityDashboard() {
	const [selectedActivity, setSelectedActivity] = useState<number | null>(null);

	const { data: suspiciousActivities, isLoading: activitiesLoading } =
		trpc.activityTracking.getSuspiciousActivities.useQuery({
			reviewed: false,
			limit: 10,
		});

	const { data: stats, isLoading: statsLoading } =
		trpc.activityTracking.getActivityStatistics.useQuery({
			days: 7,
		});

	const getSeverityColor = (severity: string) => {
		switch (severity) {
			case 'critical':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			case 'high':
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
			case 'medium':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'low':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	};

	const getSeverityIcon = (severity: string) => {
		switch (severity) {
			case 'critical':
				return <AlertTriangle className="w-5 h-5 text-red-500" />;
			case 'high':
				return <AlertCircle className="w-5 h-5 text-orange-500" />;
			case 'medium':
				return <AlertCircle className="w-5 h-5 text-yellow-500" />;
			default:
				return <Shield className="w-5 h-5 text-blue-500" />;
		}
	};

	const getActivityTypeLabel = (type: string) => {
		const labels: Record<string, string> = {
			multiple_failed_logins: 'Множественные неудачные входы',
			unusual_location: 'Необычное местоположение',
			unusual_time: 'Необычное время доступа',
			bulk_data_access: 'Массовый доступ к данным',
			permission_escalation_attempt: 'Попытка повышения привилегий',
			api_rate_limit_exceeded: 'Превышен лимит API',
			unauthorized_access_attempt: 'Попытка несанкционированного доступа',
			data_export: 'Экспорт данных',
			mass_user_modification: 'Массовое изменение пользователей',
		};
		return labels[type] || type;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ru-RU', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<div className="space-y-6">
			{/* Key Metrics */}
			{!statsLoading && stats && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{/* Total Activities */}
					<Card className="p-4 bg-slate-800 border-slate-700">
						<div className="flex items-start justify-between">
							<div>
								<p className="text-slate-400 text-sm">Всего действий (7 дней)</p>
								<p className="text-3xl font-bold text-white mt-2">
									{stats.totalActivities}
								</p>
							</div>
							<div className="p-3 bg-blue-900/30 rounded-lg">
								<Eye className="w-6 h-6 text-blue-500" />
							</div>
						</div>
					</Card>

					{/* Failed Attempts */}
					<Card className="p-4 bg-slate-800 border-slate-700">
						<div className="flex items-start justify-between">
							<div>
								<p className="text-slate-400 text-sm">Неудачные попытки</p>
								<p className="text-3xl font-bold text-white mt-2">
									{stats.byStatus?.failure || 0}
								</p>
							</div>
							<div className="p-3 bg-red-900/30 rounded-lg">
								<AlertCircle className="w-6 h-6 text-red-500" />
							</div>
						</div>
					</Card>

					{/* Unauthorized Access */}
					<Card className="p-4 bg-slate-800 border-slate-700">
						<div className="flex items-start justify-between">
							<div>
								<p className="text-slate-400 text-sm">Несанкционированный доступ</p>
								<p className="text-3xl font-bold text-white mt-2">
									{stats.byStatus?.unauthorized || 0}
								</p>
							</div>
							<div className="p-3 bg-orange-900/30 rounded-lg">
								<Lock className="w-6 h-6 text-orange-500" />
							</div>
						</div>
					</Card>

					{/* Avg Response Time */}
					<Card className="p-4 bg-slate-800 border-slate-700">
						<div className="flex items-start justify-between">
							<div>
								<p className="text-slate-400 text-sm">Средн. время ответа</p>
								<p className="text-3xl font-bold text-white mt-2">
									{stats.avgDuration}ms
								</p>
							</div>
							<div className="p-3 bg-green-900/30 rounded-lg">
								<TrendingUp className="w-6 h-6 text-green-500" />
							</div>
						</div>
					</Card>
				</div>
			)}

			{/* Main Content */}
			<Tabs defaultValue="suspicious" className="w-full">
				<TabsList className="bg-slate-800 border-b border-slate-700">
					<TabsTrigger value="suspicious" className="text-slate-300 data-[state=active]:text-white">
						<AlertTriangle className="w-4 h-4 mr-2" />
						Подозрительная активность
					</TabsTrigger>
					<TabsTrigger value="top-ips" className="text-slate-300 data-[state=active]:text-white">
						<Shield className="w-4 h-4 mr-2" />
						Топ IP адреса
					</TabsTrigger>
					<TabsTrigger value="top-endpoints" className="text-slate-300 data-[state=active]:text-white">
						<Eye className="w-4 h-4 mr-2" />
						Топ Endpoints
					</TabsTrigger>
				</TabsList>

				{/* Suspicious Activities Tab */}
				<TabsContent value="suspicious" className="space-y-4">
					<Card className="bg-slate-800 border-slate-700 overflow-hidden">
						{activitiesLoading ? (
							<div className="p-8 text-center">
								<div className="inline-flex items-center gap-2">
									<div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
									<span className="text-slate-400">Загрузка...</span>
								</div>
							</div>
						) : suspiciousActivities?.activities &&
						  suspiciousActivities.activities.length > 0 ? (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader className="bg-slate-700">
										<TableRow className="border-slate-600">
											<TableHead className="text-slate-200">Время</TableHead>
											<TableHead className="text-slate-200">Тип</TableHead>
											<TableHead className="text-slate-200">Серьезность</TableHead>
											<TableHead className="text-slate-200">Описание</TableHead>
											<TableHead className="text-slate-200 text-right">Действие</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{suspiciousActivities.activities.map((activity: any) => (
											<TableRow
												key={activity.id}
												className="border-slate-700 hover:bg-slate-700/50"
											>
												<TableCell className="text-slate-300 text-sm">
													<div className="flex items-center gap-2">
														<Clock className="w-4 h-4 text-slate-500" />
														{formatDate(activity.createdAt)}
													</div>
												</TableCell>
												<TableCell className="text-white text-sm">
													{getActivityTypeLabel(activity.activityType)}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														{getSeverityIcon(activity.severity)}
														<span
															className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
																activity.severity
															)}`}
														>
															{activity.severity.toUpperCase()}
														</span>
													</div>
												</TableCell>
												<TableCell className="text-slate-400 text-sm max-w-xs truncate">
													{activity.description}
												</TableCell>
												<TableCell className="text-right">
													<Button
														size="sm"
														variant="outline"
														onClick={() => setSelectedActivity(activity.id)}
														className="text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
													>
														Просмотр
														<ChevronRight className="w-3 h-3 ml-1" />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						) : (
							<div className="p-8 text-center">
								<div className="flex items-center justify-center gap-2 mb-2">
									<CheckCircle className="w-6 h-6 text-green-500" />
									<span className="text-slate-300 font-medium">Нет подозрительной активности</span>
								</div>
								<p className="text-slate-400 text-sm">Все системы работают нормально</p>
							</div>
						)}
					</Card>
				</TabsContent>

				{/* Top IPs Tab */}
				<TabsContent value="top-ips" className="space-y-4">
					<Card className="bg-slate-800 border-slate-700 p-6">
						{stats?.topIPs && Object.keys(stats.topIPs).length > 0 ? (
							<div className="space-y-3">
								{Object.entries(stats.topIPs)
									.sort(([, a], [, b]) => (b as number) - (a as number))
									.slice(0, 10)
									.map(([ip, count]) => (
										<div
											key={ip}
											className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600"
										>
											<div>
												<p className="text-white font-mono text-sm">{ip}</p>
												<p className="text-slate-400 text-xs">
													{count} запросов
												</p>
											</div>
											<div className="w-24 h-2 bg-slate-600 rounded-full overflow-hidden">
												<div
													className="h-full bg-blue-500"
													style={{
														width: `${
															((count as number) /
																Math.max(
																	...(Object.values(stats.topIPs) as number[])
																)) *
															100
														}%`,
													}}
												/>
											</div>
										</div>
									))}
							</div>
						) : (
							<p className="text-slate-400">Нет данных</p>
						)}
					</Card>
				</TabsContent>

				{/* Top Endpoints Tab */}
				<TabsContent value="top-endpoints" className="space-y-4">
					<Card className="bg-slate-800 border-slate-700 p-6">
						{stats?.topEndpoints && Object.keys(stats.topEndpoints).length > 0 ? (
							<div className="space-y-3">
								{Object.entries(stats.topEndpoints)
									.sort(([, a], [, b]) => (b as number) - (a as number))
									.slice(0, 10)
									.map(([endpoint, count]) => (
										<div
											key={endpoint}
											className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600"
										>
											<div>
												<p className="text-white font-mono text-sm truncate">
													{endpoint}
												</p>
												<p className="text-slate-400 text-xs">
													{count} вызовов
												</p>
											</div>
											<div className="w-24 h-2 bg-slate-600 rounded-full overflow-hidden">
												<div
													className="h-full bg-green-500"
													style={{
														width: `${
															((count as number) /
																Math.max(
																	...(Object.values(
																		stats.topEndpoints
																	) as number[])
																)) *
															100
														}%`,
													}}
												/>
											</div>
										</div>
									))}
							</div>
						) : (
							<p className="text-slate-400">Нет данных</p>
						)}
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
