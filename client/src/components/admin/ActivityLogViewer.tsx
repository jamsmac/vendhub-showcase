import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import {
	Search,
	Download,
	ChevronLeft,
	ChevronRight,
	Shield,
	AlertCircle,
	CheckCircle,
	Clock,
	Zap,
	Eye,
	Edit,
	Trash,
} from 'lucide-react';
import { toast } from 'sonner';

interface ActivityLogViewerProps {
	adminOnly?: boolean;
}

export function ActivityLogViewer({ adminOnly = false }: ActivityLogViewerProps) {
	const [action, setAction] = useState('');
	const [status, setStatus] = useState('');
	const [ipAddress, setIpAddress] = useState('');
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(20);

	const { data, isLoading, refetch } = trpc.activityTracking.getActivityLogs.useQuery(
		{
			action: action || undefined,
			status: status || undefined,
			ipAddress: ipAddress || undefined,
			page,
			limit,
		},
		{
			enabled: adminOnly,
		}
	);

	const exportMutation = trpc.activityTracking.exportActivityLogs.useMutation();

	const handleExport = async () => {
		try {
			const result = await exportMutation.mutateAsync({
				action: action || undefined,
				status: status || undefined,
			});

			const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
			const link = document.createElement('a');
			const url = URL.createObjectURL(blob);
			link.setAttribute('href', url);
			link.setAttribute('download', result.filename);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			toast.success('Activity logs exported successfully');
		} catch (error: any) {
			toast.error(error?.message || 'Failed to export logs');
		}
	};

	const getActionIcon = (action: string) => {
		switch (action) {
			case 'login':
				return <CheckCircle className="w-4 h-4 text-green-500" />;
			case 'logout':
				return <AlertCircle className="w-4 h-4 text-yellow-500" />;
			case 'api_call':
				return <Zap className="w-4 h-4 text-blue-500" />;
			case 'data_access':
				return <Eye className="w-4 h-4 text-purple-500" />;
			case 'create':
				return <Edit className="w-4 h-4 text-green-500" />;
			case 'update':
				return <Edit className="w-4 h-4 text-blue-500" />;
			case 'delete':
				return <Trash className="w-4 h-4 text-red-500" />;
			default:
				return <Shield className="w-4 h-4 text-slate-500" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'success':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'failure':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			case 'unauthorized':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'forbidden':
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'success':
				return 'Успешно';
			case 'failure':
				return 'Ошибка';
			case 'unauthorized':
				return 'Не авторизован';
			case 'forbidden':
				return 'Запрещено';
			default:
				return status;
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ru-RU', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		});
	};

	const getActionLabel = (action: string) => {
		const labels: Record<string, string> = {
			login: 'Вход',
			logout: 'Выход',
			api_call: 'API вызов',
			data_access: 'Доступ к данным',
			create: 'Создание',
			update: 'Обновление',
			delete: 'Удаление',
			role_change: 'Смена роли',
		};
		return labels[action] || action;
	};

	return (
		<div className="space-y-4">
			{/* Filters */}
			<Card className="p-4 bg-slate-800 border-slate-700">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{/* Action Filter */}
					<Select value={action} onValueChange={(value) => {
						setAction(value);
						setPage(1);
					}}>
						<SelectTrigger className="bg-slate-700 border-slate-600 text-white">
							<SelectValue placeholder="Все действия" />
						</SelectTrigger>
						<SelectContent className="bg-slate-700 border-slate-600">
							<SelectItem value="">Все действия</SelectItem>
							<SelectItem value="login">Вход</SelectItem>
							<SelectItem value="logout">Выход</SelectItem>
							<SelectItem value="api_call">API вызов</SelectItem>
							<SelectItem value="data_access">Доступ к данным</SelectItem>
							<SelectItem value="create">Создание</SelectItem>
							<SelectItem value="update">Обновление</SelectItem>
							<SelectItem value="delete">Удаление</SelectItem>
						</SelectContent>
					</Select>

					{/* Status Filter */}
					<Select value={status} onValueChange={(value) => {
						setStatus(value);
						setPage(1);
					}}>
						<SelectTrigger className="bg-slate-700 border-slate-600 text-white">
							<SelectValue placeholder="Все статусы" />
						</SelectTrigger>
						<SelectContent className="bg-slate-700 border-slate-600">
							<SelectItem value="">Все статусы</SelectItem>
							<SelectItem value="success">Успешно</SelectItem>
							<SelectItem value="failure">Ошибка</SelectItem>
							<SelectItem value="unauthorized">Не авторизован</SelectItem>
							<SelectItem value="forbidden">Запрещено</SelectItem>
						</SelectContent>
					</Select>

					{/* IP Address Filter */}
					<div className="relative">
						<Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
						<Input
							type="text"
							placeholder="Фильтр по IP..."
							value={ipAddress}
							onChange={(e) => {
								setIpAddress(e.target.value);
								setPage(1);
							}}
							className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
						/>
					</div>

					{/* Export Button */}
					{adminOnly && (
						<Button
							onClick={handleExport}
							disabled={exportMutation.isPending}
							className="bg-green-600 hover:bg-green-700 text-white"
						>
							<Download className="w-4 h-4 mr-2" />
							{exportMutation.isPending ? 'Экспорт...' : 'Экспорт CSV'}
						</Button>
					)}
				</div>
			</Card>

			{/* Table */}
			<Card className="bg-slate-800 border-slate-700 overflow-hidden">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader className="bg-slate-700">
							<TableRow className="border-slate-600 hover:bg-slate-700">
								<TableHead className="text-slate-200">Дата</TableHead>
								<TableHead className="text-slate-200">Действие</TableHead>
								<TableHead className="text-slate-200">Статус</TableHead>
								<TableHead className="text-slate-200">Endpoint</TableHead>
								<TableHead className="text-slate-200">IP Адрес</TableHead>
								<TableHead className="text-slate-200 text-right">Длительность</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-8">
										<div className="inline-flex items-center gap-2">
											<div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
											<span className="text-slate-400">Загрузка...</span>
										</div>
									</TableCell>
								</TableRow>
							) : data?.logs && data.logs.length > 0 ? (
								data.logs.map((log: any) => (
									<TableRow
										key={log.id}
										className="border-slate-700 hover:bg-slate-700/50"
									>
										<TableCell className="text-slate-300 text-sm">
											<div className="flex items-center gap-2">
												<Clock className="w-4 h-4 text-slate-500" />
												{formatDate(log.createdAt)}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												{getActionIcon(log.action)}
												<span className="text-white text-sm">
													{getActionLabel(log.action)}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
													log.status
												)}`}
											>
												{getStatusLabel(log.status)}
											</span>
										</TableCell>
										<TableCell className="text-slate-300 text-sm font-mono max-w-xs truncate">
											{log.endpoint}
										</TableCell>
										<TableCell className="text-slate-300 text-sm font-mono">
											{log.ipAddress}
										</TableCell>
										<TableCell className="text-right text-slate-400 text-sm">
											{log.duration ? `${log.duration}ms` : '—'}
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-8">
										<span className="text-slate-400">Записей не найдено</span>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</Card>

			{/* Pagination */}
			{data && data.total > 0 && (
				<div className="flex items-center justify-between">
					<span className="text-sm text-slate-400">
						Всего записей: {data.total}
					</span>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage(Math.max(1, page - 1))}
							disabled={page === 1}
							className="border-slate-600 text-slate-300 hover:bg-slate-700"
						>
							<ChevronLeft className="w-4 h-4" />
						</Button>
						<span className="text-sm text-slate-400 px-2 py-1">
							Страница {page}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage(page + 1)}
							disabled={!data?.logs || data.logs.length < limit}
							className="border-slate-600 text-slate-300 hover:bg-slate-700"
						>
							<ChevronRight className="w-4 h-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
