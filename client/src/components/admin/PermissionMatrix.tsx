import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Search, AlertCircle, Shield, Lock, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Permission {
	id: number;
	key: string;
	name: string;
	description?: string;
	category: string;
	riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface PermissionMatrixProps {
	permissions: Permission[];
	selectedPermissions: number[];
	onPermissionToggle: (permissionId: number) => void;
	isLoading?: boolean;
}

export function PermissionMatrix({
	permissions,
	selectedPermissions,
	onPermissionToggle,
	isLoading = false,
}: PermissionMatrixProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('');
	const [riskFilter, setRiskFilter] = useState('');

	// Get unique categories
	const categories = Array.from(new Set(permissions.map((p) => p.category))).sort();

	// Filter permissions
	const filteredPermissions = permissions.filter((perm) => {
		const matchesSearch =
			perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			perm.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(perm.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

		const matchesCategory = !categoryFilter || perm.category === categoryFilter;
		const matchesRisk = !riskFilter || perm.riskLevel === riskFilter;

		return matchesSearch && matchesCategory && matchesRisk;
	});

	// Group by category
	const groupedPermissions = categories.reduce(
		(acc, category) => {
			acc[category] = filteredPermissions.filter((p) => p.category === category);
			return acc;
		},
		{} as Record<string, Permission[]>
	);

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
				return <Shield className="w-4 h-4" />;
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

	return (
		<div className="space-y-4">
			{/* Filters */}
			<Card className="p-4 bg-slate-800 border-slate-700">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Search */}
					<div className="relative">
						<Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
						<Input
							type="text"
							placeholder="Поиск разрешений..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
						/>
					</div>

					{/* Category Filter */}
					<Select value={categoryFilter} onValueChange={setCategoryFilter}>
						<SelectTrigger className="bg-slate-700 border-slate-600 text-white">
							<SelectValue placeholder="Все категории" />
						</SelectTrigger>
						<SelectContent className="bg-slate-700 border-slate-600">
							<SelectItem value="">Все категории</SelectItem>
							{categories.map((cat) => (
								<SelectItem key={cat} value={cat}>
									{getCategoryLabel(cat)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* Risk Level Filter */}
					<Select value={riskFilter} onValueChange={setRiskFilter}>
						<SelectTrigger className="bg-slate-700 border-slate-600 text-white">
							<SelectValue placeholder="Все уровни риска" />
						</SelectTrigger>
						<SelectContent className="bg-slate-700 border-slate-600">
							<SelectItem value="">Все уровни риска</SelectItem>
							<SelectItem value="low">Низкий</SelectItem>
							<SelectItem value="medium">Средний</SelectItem>
							<SelectItem value="high">Высокий</SelectItem>
							<SelectItem value="critical">Критический</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</Card>

			{/* Permissions Table */}
			<div className="space-y-6">
				{Object.entries(groupedPermissions).map(([category, perms]) => (
					<div key={category}>
						<h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
							<Shield className="w-5 h-5 text-blue-500" />
							{getCategoryLabel(category)}
						</h3>

						<Card className="bg-slate-800 border-slate-700 overflow-hidden">
							<div className="overflow-x-auto">
								<Table>
									<TableHeader className="bg-slate-700">
										<TableRow className="border-slate-600">
											<TableHead className="w-12 text-slate-200">
												<Checkbox
													checked={perms.every((p) =>
														selectedPermissions.includes(p.id)
													)}
													indeterminate={
														perms.some((p) =>
															selectedPermissions.includes(p.id)
														) &&
														!perms.every((p) =>
															selectedPermissions.includes(p.id)
														)
													}
													onCheckedChange={(checked) => {
														perms.forEach((p) => {
															const isSelected =
																selectedPermissions.includes(p.id);
															if (
																(checked === true && !isSelected) ||
																(checked === false && isSelected)
															) {
																onPermissionToggle(p.id);
															}
														});
													}}
													disabled={isLoading}
												/>
											</TableHead>
											<TableHead className="text-slate-200">Разрешение</TableHead>
											<TableHead className="text-slate-200">Описание</TableHead>
											<TableHead className="text-slate-200 text-center">
												Уровень риска
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{perms.map((perm) => (
											<TableRow
												key={perm.id}
												className="border-slate-700 hover:bg-slate-700/50"
											>
												<TableCell>
													<Checkbox
														checked={selectedPermissions.includes(perm.id)}
														onCheckedChange={() => onPermissionToggle(perm.id)}
														disabled={isLoading}
													/>
												</TableCell>
												<TableCell>
													<div>
														<p className="text-white font-medium text-sm">
															{perm.name}
														</p>
														<p className="text-slate-400 text-xs font-mono">
															{perm.key}
														</p>
													</div>
												</TableCell>
												<TableCell className="text-slate-300 text-sm max-w-xs">
													{perm.description || '—'}
												</TableCell>
												<TableCell className="text-center">
													<div className="flex items-center justify-center gap-1">
														{getRiskIcon(perm.riskLevel)}
														<Badge
															className={`${getRiskColor(perm.riskLevel)} text-xs`}
														>
															{getRiskLabel(perm.riskLevel)}
														</Badge>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</Card>
					</div>
				))}

				{Object.keys(groupedPermissions).length === 0 && (
					<Card className="p-8 bg-slate-800 border-slate-700 text-center">
						<p className="text-slate-400">Разрешения не найдены</p>
					</Card>
				)}
			</div>

			{/* Summary */}
			<Card className="p-4 bg-slate-700/50 border-slate-600">
				<p className="text-slate-300 text-sm">
					Выбрано разрешений:{' '}
					<span className="font-semibold text-white">{selectedPermissions.length}</span> из{' '}
					<span className="font-semibold text-white">{permissions.length}</span>
				</p>
			</Card>
		</div>
	);
}
