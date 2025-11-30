import { useMemo } from 'react';

export type UserRole = 'user' | 'operator' | 'manager' | 'admin';

interface Permission {
	id: number;
	key: string;
	name: string;
	category: string;
	riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Role hierarchy: each role inherits permissions from lower roles
 * user < operator < manager < admin
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
	user: 0,
	operator: 1,
	manager: 2,
	admin: 3,
};

/**
 * Default permissions for each role
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
	user: [
		'users.view_own_profile',
		'machines.view',
		'inventory.view',
		'reports.view_own',
	],
	operator: [
		'users.view_own_profile',
		'machines.view',
		'machines.update',
		'machines.restock',
		'inventory.view',
		'inventory.update',
		'reports.view_own',
	],
	manager: [
		'users.view',
		'users.view_own_profile',
		'machines.view',
		'machines.update',
		'machines.restock',
		'inventory.view',
		'inventory.update',
		'inventory.export',
		'reports.view',
		'reports.export',
		'reports.analytics',
	],
	admin: [
		'users.view',
		'users.create',
		'users.update',
		'users.delete',
		'users.assign_roles',
		'users.suspend',
		'machines.view',
		'machines.create',
		'machines.update',
		'machines.delete',
		'machines.restock',
		'inventory.view',
		'inventory.create',
		'inventory.update',
		'inventory.delete',
		'inventory.export',
		'reports.view',
		'reports.create',
		'reports.export',
		'reports.analytics',
		'settings.view',
		'settings.update',
		'audit.view',
		'audit.export',
		'permissions.manage',
	],
};

/**
 * Hook to manage permission hierarchy and inheritance
 */
export function usePermissionHierarchy() {
	/**
	 * Check if a role inherits from another role
	 */
	const inheritsFrom = (role: UserRole, parentRole: UserRole): boolean => {
		return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[parentRole];
	};

	/**
	 * Get inherited permissions for a role
	 * Returns permissions from the role and all lower roles
	 */
	const getInheritedPermissions = (role: UserRole, allPermissions: Permission[]) => {
		const inheritedKeys = new Set<string>();

		// Add permissions from this role and all lower roles
		for (const [r, level] of Object.entries(ROLE_HIERARCHY)) {
			if (level <= ROLE_HIERARCHY[role]) {
				DEFAULT_ROLE_PERMISSIONS[r as UserRole].forEach((key) => {
					inheritedKeys.add(key);
				});
			}
		}

		// Return permission objects that match inherited keys
		return allPermissions.filter((p) => inheritedKeys.has(p.key));
	};

	/**
	 * Get permissions that are exclusive to a role (not inherited)
	 */
	const getExclusivePermissions = (role: UserRole, allPermissions: Permission[]) => {
		const inherited = getInheritedPermissions(role, allPermissions);
		const inheritedIds = new Set(inherited.map((p) => p.id));

		// Get all permissions for this role
		const rolePerms = allPermissions.filter((p) =>
			DEFAULT_ROLE_PERMISSIONS[role].includes(p.key)
		);

		// Return only those not inherited from lower roles
		return rolePerms.filter((p) => !inheritedIds.has(p.id));
	};

	/**
	 * Get the minimum role required for a permission
	 */
	const getMinimumRoleForPermission = (permissionKey: string): UserRole | null => {
		for (const [role, keys] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
			if (keys.includes(permissionKey)) {
				return role as UserRole;
			}
		}
		return null;
	};

	/**
	 * Check if a permission is high-risk and requires careful consideration
	 */
	const isHighRiskPermission = (permission: Permission): boolean => {
		return permission.riskLevel === 'high' || permission.riskLevel === 'critical';
	};

	/**
	 * Get warnings for a role configuration
	 */
	const getConfigurationWarnings = (
		role: UserRole,
		selectedPermissions: Permission[]
	): string[] => {
		const warnings: string[] = [];

		const criticalPerms = selectedPermissions.filter((p) => p.riskLevel === 'critical');
		const highRiskPerms = selectedPermissions.filter((p) => p.riskLevel === 'high');

		if (criticalPerms.length > 0) {
			warnings.push(
				`${criticalPerms.length} критическое разрешение(я). Убедитесь, что это намеренно.`
			);
		}

		if (highRiskPerms.length > 5) {
			warnings.push(
				`${highRiskPerms.length} разрешений высокого риска. Рассмотрите возможность ограничения доступа.`
			);
		}

		// Check for unusual permission combinations
		const hasDeletePerms = selectedPermissions.some((p) => p.key.includes('delete'));
		const hasCreatePerms = selectedPermissions.some((p) => p.key.includes('create'));

		if (hasDeletePerms && !hasCreatePerms && role !== 'admin') {
			warnings.push('Разрешение на удаление без разрешения на создание необычно.');
		}

		return warnings;
	};

	/**
	 * Suggest permissions for a role based on common use cases
	 */
	const suggestPermissionsForRole = (role: UserRole): string[] => {
		return DEFAULT_ROLE_PERMISSIONS[role];
	};

	return {
		inheritsFrom,
		getInheritedPermissions,
		getExclusivePermissions,
		getMinimumRoleForPermission,
		isHighRiskPermission,
		getConfigurationWarnings,
		suggestPermissionsForRole,
		ROLE_HIERARCHY,
		DEFAULT_ROLE_PERMISSIONS,
	};
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
	const descriptions: Record<UserRole, string> = {
		user: 'Базовый пользователь с доступом только к своим данным',
		operator: 'Оператор может управлять машинами и инвентарем',
		manager: 'Менеджер имеет доступ к отчетам и аналитике',
		admin: 'Администратор имеет полный доступ к системе',
	};
	return descriptions[role];
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
	const names: Record<UserRole, string> = {
		user: 'Пользователь',
		operator: 'Оператор',
		manager: 'Менеджер',
		admin: 'Администратор',
	};
	return names[role];
}

/**
 * Get role color for UI
 */
export function getRoleColor(role: UserRole): string {
	const colors: Record<UserRole, string> = {
		user: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		operator: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		manager: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
		admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
	};
	return colors[role];
}
