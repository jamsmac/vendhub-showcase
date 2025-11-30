import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PermissionMatrix } from '@/components/admin/PermissionMatrix';
import { RolePreviewPanel } from '@/components/admin/RolePreviewPanel';
import { usePermissionHierarchy, getRoleDisplayName, getRoleColor } from '@/hooks/usePermissionHierarchy';
import {
	AlertCircle,
	Save,
	RotateCcw,
	Shield,
	RefreshCw,
	CheckCircle,
	AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

type UserRole = 'user' | 'operator' | 'manager' | 'admin';

export default function AdminPermissions() {
	const [selectedRole, setSelectedRole] = useState<UserRole>('user');
	const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
	const [hasChanges, setHasChanges] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const { getConfigurationWarnings, suggestPermissionsForRole } = usePermissionHierarchy();

	// Fetch all permissions
	const { data: allPermissions, isLoading: permissionsLoading } =
		trpc.permissions.getAllPermissions.useQuery();

	// Fetch current role permissions
	const { data: rolePermissions, isLoading: rolePermissionsLoading } =
		trpc.permissions.getRolePermissions.useQuery({ role: selectedRole });

	// Update role permissions mutation
	const updatePermissionsMutation = trpc.permissions.updateRolePermissions.useMutation();

	// Initialize selected permissions when role changes
	const handleRoleChange = (role: UserRole) => {
		if (hasChanges) {
			const confirmed = window.confirm(
				'У вас есть несохраненные изменения. Вы уверены, что хотите переключиться?'
			);
			if (!confirmed) return;
		}

		setSelectedRole(role);
		setSelectedPermissions(rolePermissions?.map((p: any) => p.id) || []);
		setHasChanges(false);
	};

	// Toggle permission
	const handlePermissionToggle = (permissionId: number) => {
		setSelectedPermissions((prev) => {
			if (prev.includes(permissionId)) {
				return prev.filter((id) => id !== permissionId);
			} else {
				return [...prev, permissionId];
			}
		});
		setHasChanges(true);
	};

	// Save changes
	const handleSave = async () => {
		if (!allPermissions) return;

		setIsSaving(true);
		try {
			await updatePermissionsMutation.mutateAsync({
				role: selectedRole,
				permissionIds: selectedPermissions,
				reason: 'Admin updated permissions',
			});

			toast.success(`Разрешения для роли ${getRoleDisplayName(selectedRole)} сохранены`);
			setHasChanges(false);

			// Refetch role permissions
			await trpc.permissions.getRolePermissions.refetch({ role: selectedRole });
		} catch (error: any) {
			toast.error(error?.message || 'Ошибка при сохранении разрешений');
		} finally {
			setIsSaving(false);
		}
	};

	// Discard changes
	const handleDiscard = () => {
		if (window.confirm('Отменить все изменения?')) {
			setSelectedPermissions(rolePermissions?.map((p: any) => p.id) || []);
			setHasChanges(false);
		}
	};

	// Apply suggested permissions
	const handleApplySuggested = () => {
		if (!allPermissions) return;

		const suggested = suggestPermissionsForRole(selectedRole);
		const suggestedIds = allPermissions
			.filter((p: any) => suggested.includes(p.key))
			.map((p: any) => p.id);

		setSelectedPermissions(suggestedIds);
		setHasChanges(true);
		toast.info('Применены рекомендуемые разрешения');
	};

	// Get selected permission objects
	const selectedPermissionObjects = allPermissions?.filter((p: any) =>
		selectedPermissions.includes(p.id)
	) || [];

	// Get warnings
	const warnings = getConfigurationWarnings(selectedRole, selectedPermissionObjects);

	const isLoading = permissionsLoading || rolePermissionsLoading;

	return (
		<ProtectedRoute requiredRole="admin">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-white">Редактор разрешений</h1>
						<p className="text-slate-400 mt-1">
							Управляйте разрешениями для каждой роли в системе
						</p>
					</div>
				</div>

				{/* Role Selector */}
				<Card className="p-4 bg-slate-800 border-slate-700">
					<h3 className="text-sm font-semibold text-slate-300 mb-3">Выберите роль</h3>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
						{(['user', 'operator', 'manager', 'admin'] as UserRole[]).map((role) => (
							<button
								key={role}
								onClick={() => handleRoleChange(role)}
								className={`p-3 rounded-lg border-2 transition-colors ${
									selectedRole === role
										? 'bg-blue-900/50 border-blue-500'
										: 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
								}`}
							>
								<p className="text-white font-medium text-sm">{getRoleDisplayName(role)}</p>
								<p className="text-slate-400 text-xs mt-1">
									{selectedPermissions.length} разрешений
								</p>
							</button>
						))}
					</div>
				</Card>

				{/* Warnings */}
				{warnings.length > 0 && (
					<Card className="p-4 bg-yellow-900/30 border-yellow-700">
						<div className="space-y-2">
							{warnings.map((warning, idx) => (
								<div key={idx} className="flex items-start gap-2">
									<AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
									<p className="text-yellow-200 text-sm">{warning}</p>
								</div>
							))}
						</div>
					</Card>
				)}

				{/* Main Content */}
				{isLoading ? (
					<Card className="p-8 bg-slate-800 border-slate-700 text-center">
						<div className="inline-flex items-center gap-2">
							<div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
							<span className="text-slate-400">Загрузка...</span>
						</div>
					</Card>
				) : (
					<Tabs defaultValue="matrix" className="w-full">
						<TabsList className="bg-slate-800 border-b border-slate-700">
							<TabsTrigger value="matrix" className="text-slate-300 data-[state=active]:text-white">
								<Shield className="w-4 h-4 mr-2" />
								Матрица разрешений
							</TabsTrigger>
							<TabsTrigger value="preview" className="text-slate-300 data-[state=active]:text-white">
								<Eye className="w-4 h-4 mr-2" />
								Предпросмотр доступа
							</TabsTrigger>
						</TabsList>

						{/* Permission Matrix Tab */}
						<TabsContent value="matrix" className="space-y-4">
							<div className="flex gap-2">
								<Button
									onClick={handleApplySuggested}
									variant="outline"
									className="border-slate-600 text-slate-300 hover:bg-slate-700"
									disabled={isLoading}
								>
									<RefreshCw className="w-4 h-4 mr-2" />
									Применить рекомендуемые
								</Button>
							</div>

							{allPermissions && (
								<PermissionMatrix
									permissions={allPermissions}
									selectedPermissions={selectedPermissions}
									onPermissionToggle={handlePermissionToggle}
									isLoading={isLoading}
								/>
							)}
						</TabsContent>

						{/* Preview Tab */}
						<TabsContent value="preview" className="space-y-4">
							{allPermissions && (
								<RolePreviewPanel
									role={selectedRole}
									selectedPermissions={selectedPermissionObjects}
									allPermissions={allPermissions}
								/>
							)}
						</TabsContent>
					</Tabs>
				)}

				{/* Action Buttons */}
				<div className="flex gap-3 sticky bottom-0 bg-slate-900/95 p-4 rounded-lg border border-slate-700">
					<Button
						onClick={handleSave}
						disabled={!hasChanges || isSaving || isLoading}
						className="bg-green-600 hover:bg-green-700 text-white"
					>
						<Save className="w-4 h-4 mr-2" />
						{isSaving ? 'Сохранение...' : 'Сохранить изменения'}
					</Button>

					<Button
						onClick={handleDiscard}
						disabled={!hasChanges || isLoading}
						variant="outline"
						className="border-slate-600 text-slate-300 hover:bg-slate-700"
					>
						<RotateCcw className="w-4 h-4 mr-2" />
						Отменить
					</Button>

					{hasChanges && (
						<div className="ml-auto flex items-center gap-2 text-yellow-500">
							<AlertCircle className="w-4 h-4" />
							<span className="text-sm">У вас есть несохраненные изменения</span>
						</div>
					)}

					{!hasChanges && selectedPermissions.length > 0 && (
						<div className="ml-auto flex items-center gap-2 text-green-500">
							<CheckCircle className="w-4 h-4" />
							<span className="text-sm">Все изменения сохранены</span>
						</div>
					)}
				</div>
			</div>
		</ProtectedRoute>
	);
}

// Import Eye icon
import { Eye } from 'lucide-react';
