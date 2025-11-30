import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Users,
	Package,
	BarChart3,
	Settings,
	Lock,
	Eye,
	Edit,
	Trash,
	CheckCircle,
	AlertCircle,
	Shield,
} from 'lucide-react';

interface Permission {
	id: number;
	key: string;
	name: string;
	description?: string;
	category: string;
	riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface RolePreviewPanelProps {
	role: 'user' | 'operator' | 'manager' | 'admin';
	selectedPermissions: Permission[];
	allPermissions: Permission[];
}

export function RolePreviewPanel({
	role,
	selectedPermissions,
	allPermissions,
}: RolePreviewPanelProps) {
	const getCategoryIcon = (category: string) => {
		switch (category) {
			case 'users':
				return <Users className="w-4 h-4" />;
			case 'machines':
				return <Package className="w-4 h-4" />;
			case 'inventory':
				return <BarChart3 className="w-4 h-4" />;
			case 'reports':
				return <BarChart3 className="w-4 h-4" />;
			case 'settings':
				return <Settings className="w-4 h-4" />;
			case 'audit':
				return <Shield className="w-4 h-4" />;
			case 'financial':
				return <BarChart3 className="w-4 h-4" />;
			default:
				return <Shield className="w-4 h-4" />;
		}
	};

	const getCategoryLabel = (category: string) => {
		const labels: Record<string, string> = {
			users: 'Управление пользователями',
			machines: 'Управление машинами',
			inventory: 'Управление инвентарем',
			reports: 'Отчеты',
			settings: 'Настройки системы',
			audit: 'Аудит и безопасность',
			financial: 'Финансовые операции',
		};
		return labels[category] || category;
	};

	const getRoleLabel = (role: string) => {
		const labels: Record<string, string> = {
			user: 'Пользователь',
			operator: 'Оператор',
			manager: 'Менеджер',
			admin: 'Администратор',
		};
		return labels[role] || role;
	};

	const getRoleDescription = (role: string) => {
		const descriptions: Record<string, string> = {
			user: 'Базовый пользователь с ограниченным доступом',
			operator: 'Оператор может управлять машинами и инвентарем',
			manager: 'Менеджер имеет доступ к отчетам и аналитике',
			admin: 'Администратор имеет полный доступ к системе',
		};
		return descriptions[role] || '';
	};

	const getRiskColor = (riskLevel: string) => {
		switch (riskLevel) {
			case 'critical':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			case 'high':
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
			case 'medium':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'low':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	};

	const getRiskIcon = (riskLevel: string) => {
		switch (riskLevel) {
			case 'critical':
				return <AlertCircle className="w-4 h-4" />;
			case 'high':
				return <Lock className="w-4 h-4" />;
			case 'medium':
				return <Eye className="w-4 h-4" />;
			default:
				return <CheckCircle className="w-4 h-4" />;
		}
	};

	const getRiskLabel = (riskLevel: string) => {
		const labels: Record<string, string> = {
			critical: 'Критический',
			high: 'Высокий',
			medium: 'Средний',
			low: 'Низкий',
		};
		return labels[riskLevel] || riskLevel;
	};

	// Group permissions by category
	const categories = Array.from(new Set(allPermissions.map((p) => p.category))).sort();
	const groupedPermissions = categories.reduce(
		(acc, category) => {
			acc[category] = allPermissions.filter((p) => p.category === category);
			return acc;
		},
		{} as Record<string, Permission[]>
	);

	// Calculate statistics
	const totalPermissions = selectedPermissions.length;
	const criticalPermissions = selectedPermissions.filter((p) => p.riskLevel === 'critical').length;
	const highRiskPermissions = selectedPermissions.filter((p) => p.riskLevel === 'high').length;

	return (
		<div className="space-y-4">
			{/* Role Header */}
			<Card className="p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-slate-700">
				<div className="space-y-2">
					<h2 className="text-2xl font-bold text-white">{getRoleLabel(role)}</h2>
					<p className="text-slate-300">{getRoleDescription(role)}</p>
				</div>
			</Card>

			{/* Statistics */}
			<div className="grid grid-cols-3 gap-4">
				<Card className="p-4 bg-slate-800 border-slate-700">
					<p className="text-slate-400 text-sm">Всего разрешений</p>
					<p className="text-3xl font-bold text-white mt-2">{totalPermissions}</p>
				</Card>
				<Card className="p-4 bg-slate-800 border-slate-700">
					<p className="text-slate-400 text-sm">Критические разрешения</p>
					<p className="text-3xl font-bold text-red-500 mt-2">{criticalPermissions}</p>
				</Card>
				<Card className="p-4 bg-slate-800 border-slate-700">
					<p className="text-slate-400 text-sm">Высокий риск</p>
					<p className="text-3xl font-bold text-orange-500 mt-2">{highRiskPermissions}</p>
				</Card>
			</div>

			{/* Permissions by Category */}
			<Tabs defaultValue={categories[0] || 'users'} className="w-full">
				<TabsList className="bg-slate-800 border-b border-slate-700 w-full justify-start overflow-x-auto">
					{categories.map((category) => (
						<TabsTrigger
							key={category}
							value={category}
							className="text-slate-300 data-[state=active]:text-white flex items-center gap-2"
						>
							{getCategoryIcon(category)}
							{getCategoryLabel(category)}
						</TabsTrigger>
					))}
				</TabsList>

				{categories.map((category) => {
					const categoryPerms = groupedPermissions[category];
					const selectedCategoryPerms = selectedPermissions.filter(
						(p) => p.category === category
					);

					return (
						<TabsContent key={category} value={category} className="space-y-4">
							<Card className="p-4 bg-slate-700/50 border-slate-600">
								<p className="text-slate-300 text-sm">
									Выбрано:{' '}
									<span className="font-semibold text-white">
										{selectedCategoryPerms.length}
									</span>{' '}
									из{' '}
									<span className="font-semibold text-white">
										{categoryPerms.length}
									</span>
								</p>
							</Card>

							<div className="space-y-3">
								{categoryPerms.map((perm) => {
									const isSelected = selectedPermissions.some((p) => p.id === perm.id);

									return (
										<Card
											key={perm.id}
											className={`p-4 border-2 transition-colors ${
												isSelected
													? 'bg-slate-700/70 border-blue-500'
													: 'bg-slate-700/30 border-slate-600'
											}`}
										>
											<div className="flex items-start justify-between gap-4">
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														<p className="text-white font-medium">{perm.name}</p>
														{isSelected && (
															<CheckCircle className="w-4 h-4 text-green-500" />
														)}
													</div>
													<p className="text-slate-400 text-sm font-mono mb-2">
														{perm.key}
													</p>
													{perm.description && (
														<p className="text-slate-400 text-sm">
															{perm.description}
														</p>
													)}
												</div>
												<Badge className={`${getRiskColor(perm.riskLevel)} text-xs`}>
													<div className="flex items-center gap-1">
														{getRiskIcon(perm.riskLevel)}
														{getRiskLabel(perm.riskLevel)}
													</div>
												</Badge>
											</div>
										</Card>
									);
								})}
							</div>
						</TabsContent>
					);
				})}
			</Tabs>

			{/* Access Summary */}
			<Card className="p-6 bg-slate-800 border-slate-700">
				<h3 className="text-lg font-semibold text-white mb-4">Сводка доступа</h3>

				<div className="space-y-3">
					{selectedPermissions.length === 0 ? (
						<p className="text-slate-400 text-sm">Нет выбранных разрешений</p>
					) : (
						<>
							<div className="flex items-center gap-2">
								<Users className="w-4 h-4 text-blue-500" />
								<span className="text-slate-300 text-sm">
									Может управлять пользователями:{' '}
									<span className="font-semibold text-white">
										{selectedPermissions.some((p) => p.key.includes('users.'))
											? 'Да'
											: 'Нет'}
									</span>
								</span>
							</div>

							<div className="flex items-center gap-2">
								<Package className="w-4 h-4 text-green-500" />
								<span className="text-slate-300 text-sm">
									Может управлять машинами:{' '}
									<span className="font-semibold text-white">
										{selectedPermissions.some((p) => p.key.includes('machines.'))
											? 'Да'
											: 'Нет'}
									</span>
								</span>
							</div>

							<div className="flex items-center gap-2">
								<BarChart3 className="w-4 h-4 text-purple-500" />
								<span className="text-slate-300 text-sm">
									Может просматривать отчеты:{' '}
									<span className="font-semibold text-white">
										{selectedPermissions.some((p) => p.key.includes('reports.'))
											? 'Да'
											: 'Нет'}
									</span>
								</span>
							</div>

							<div className="flex items-center gap-2">
								<Settings className="w-4 h-4 text-slate-400" />
								<span className="text-slate-300 text-sm">
									Может изменять настройки:{' '}
									<span className="font-semibold text-white">
										{selectedPermissions.some((p) => p.key.includes('settings.'))
											? 'Да'
											: 'Нет'}
									</span>
								</span>
							</div>

							<div className="flex items-center gap-2">
								<Shield className="w-4 h-4 text-red-500" />
								<span className="text-slate-300 text-sm">
									Может просматривать логи аудита:{' '}
									<span className="font-semibold text-white">
										{selectedPermissions.some((p) => p.key.includes('audit.'))
											? 'Да'
											: 'Нет'}
									</span>
								</span>
							</div>
						</>
					)}
				</div>
			</Card>
		</div>
	);
}
