/**
 * Permission validation and conflict detection utilities
 */

interface Permission {
	id: number;
	key: string;
	name: string;
	category: string;
	riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
	suggestions: string[];
}

/**
 * Validate a set of permissions for a role
 */
export function validatePermissions(
	permissions: Permission[],
	role: string
): ValidationResult {
	const result: ValidationResult = {
		isValid: true,
		errors: [],
		warnings: [],
		suggestions: [],
	};

	if (permissions.length === 0) {
		result.warnings.push('Роль не имеет никаких разрешений');
	}

	// Check for conflicting permissions
	const conflicts = detectConflicts(permissions);
	if (conflicts.length > 0) {
		result.errors.push(...conflicts);
		result.isValid = false;
	}

	// Check for suspicious combinations
	const suspiciousCombos = detectSuspiciousCombinations(permissions);
	if (suspiciousCombos.length > 0) {
		result.warnings.push(...suspiciousCombos);
	}

	// Check for missing related permissions
	const missing = detectMissingRelatedPermissions(permissions);
	if (missing.length > 0) {
		result.suggestions.push(...missing);
	}

	// Check for excessive permissions
	const criticalCount = permissions.filter((p) => p.riskLevel === 'critical').length;
	const highCount = permissions.filter((p) => p.riskLevel === 'high').length;

	if (criticalCount > 5) {
		result.warnings.push(
			`${criticalCount} критических разрешений. Убедитесь, что это намеренно.`
		);
	}

	if (highCount > 10) {
		result.warnings.push(
			`${highCount} разрешений высокого риска. Рассмотрите возможность ограничения доступа.`
		);
	}

	return result;
}

/**
 * Detect conflicting permissions
 */
function detectConflicts(permissions: Permission[]): string[] {
	const conflicts: string[] = [];
	const keys = permissions.map((p) => p.key);

	// Define conflicting permission pairs
	const conflictPairs = [
		['users.delete', 'users.create'], // Doesn't make sense to delete but not create
		['machines.delete', 'machines.view'], // If you can delete, you should be able to view
		['inventory.delete', 'inventory.view'], // If you can delete, you should be able to view
	];

	for (const [perm1, perm2] of conflictPairs) {
		const has1 = keys.some((k) => k.includes(perm1));
		const has2 = keys.some((k) => k.includes(perm2));

		if (has1 && !has2) {
			conflicts.push(`Разрешение "${perm1}" требует "${perm2}"`);
		}
	}

	return conflicts;
}

/**
 * Detect suspicious permission combinations
 */
function detectSuspiciousCombinations(permissions: Permission[]): string[] {
	const warnings: string[] = [];
	const keys = permissions.map((p) => p.key);

	// Check for unusual combinations
	const hasDeletePerms = keys.some((k) => k.includes('delete'));
	const hasCreatePerms = keys.some((k) => k.includes('create'));
	const hasUpdatePerms = keys.some((k) => k.includes('update'));

	if (hasDeletePerms && !hasCreatePerms && !hasUpdatePerms) {
		warnings.push('Разрешение на удаление без разрешения на создание/обновление необычно');
	}

	// Check for excessive admin-like permissions for non-admin roles
	const adminPerms = keys.filter(
		(k) =>
			k.includes('assign_roles') ||
			k.includes('suspend') ||
			k.includes('delete') ||
			k.includes('audit')
	).length;

	if (adminPerms > 3) {
		warnings.push('Эта роль имеет много административных разрешений');
	}

	// Check for data export without view permissions
	const hasExportPerms = keys.some((k) => k.includes('export'));
	const hasViewPerms = keys.some((k) => k.includes('view'));

	if (hasExportPerms && !hasViewPerms) {
		warnings.push('Разрешение на экспорт без разрешения на просмотр необычно');
	}

	return warnings;
}

/**
 * Detect missing related permissions
 */
function detectMissingRelatedPermissions(permissions: Permission[]): string[] {
	const suggestions: string[] = [];
	const keys = permissions.map((p) => p.key);

	// Define related permission groups
	const relatedGroups = [
		{
			main: 'users.create',
			related: ['users.view'],
			message: 'Для создания пользователей рекомендуется разрешение на просмотр',
		},
		{
			main: 'machines.update',
			related: ['machines.view'],
			message: 'Для обновления машин рекомендуется разрешение на просмотр',
		},
		{
			main: 'inventory.delete',
			related: ['inventory.view', 'inventory.update'],
			message: 'Для удаления инвентаря рекомендуется разрешение на просмотр и обновление',
		},
		{
			main: 'reports.export',
			related: ['reports.view'],
			message: 'Для экспорта отчетов рекомендуется разрешение на просмотр',
		},
	];

	for (const group of relatedGroups) {
		if (keys.some((k) => k.includes(group.main))) {
			const hasMissing = group.related.some(
				(rel) => !keys.some((k) => k.includes(rel))
			);

			if (hasMissing) {
				suggestions.push(group.message);
			}
		}
	}

	return suggestions;
}

/**
 * Check if a permission is safe to grant
 */
export function isSafeToGrant(permission: Permission, role: string): boolean {
	// Critical permissions should only be granted to admins
	if (permission.riskLevel === 'critical' && role !== 'admin') {
		return false;
	}

	// High-risk permissions should be carefully considered
	if (permission.riskLevel === 'high' && role === 'user') {
		return false;
	}

	return true;
}

/**
 * Get permission impact assessment
 */
export function getPermissionImpact(permission: Permission): {
	level: 'low' | 'medium' | 'high' | 'critical';
	description: string;
	affectedAreas: string[];
} {
	const impacts: Record<string, any> = {
		'users.delete': {
			level: 'critical',
			description: 'Может удалять пользовательские аккаунты',
			affectedAreas: ['User Management', 'Security', 'Compliance'],
		},
		'users.assign_roles': {
			level: 'critical',
			description: 'Может назначать роли и повышать привилегии',
			affectedAreas: ['Access Control', 'Security'],
		},
		'machines.delete': {
			level: 'high',
			description: 'Может удалять записи о машинах',
			affectedAreas: ['Inventory', 'Operations'],
		},
		'audit.view': {
			level: 'high',
			description: 'Может просматривать логи аудита и историю действий',
			affectedAreas: ['Security', 'Compliance'],
		},
		'settings.update': {
			level: 'high',
			description: 'Может изменять системные настройки',
			affectedAreas: ['System Configuration', 'Security'],
		},
		'inventory.export': {
			level: 'medium',
			description: 'Может экспортировать данные инвентаря',
			affectedAreas: ['Data Export', 'Reporting'],
		},
		'reports.view': {
			level: 'medium',
			description: 'Может просматривать отчеты и аналитику',
			affectedAreas: ['Reporting', 'Analytics'],
		},
		'machines.view': {
			level: 'low',
			description: 'Может просматривать информацию о машинах',
			affectedAreas: ['Operations'],
		},
	};

	return (
		impacts[permission.key] || {
			level: permission.riskLevel,
			description: permission.description || 'Разрешение на доступ',
			affectedAreas: [permission.category],
		}
	);
}

/**
 * Compare two permission sets
 */
export function comparePermissions(
	before: Permission[],
	after: Permission[]
): {
	added: Permission[];
	removed: Permission[];
	unchanged: Permission[];
} {
	const beforeIds = new Set(before.map((p) => p.id));
	const afterIds = new Set(after.map((p) => p.id));

	const added = after.filter((p) => !beforeIds.has(p.id));
	const removed = before.filter((p) => !afterIds.has(p.id));
	const unchanged = before.filter((p) => afterIds.has(p.id));

	return { added, removed, unchanged };
}

/**
 * Get permission audit trail
 */
export function generateAuditMessage(
	role: string,
	before: Permission[],
	after: Permission[]
): string {
	const { added, removed } = comparePermissions(before, after);

	const messages: string[] = [];

	if (added.length > 0) {
		messages.push(`Добавлены разрешения: ${added.map((p) => p.name).join(', ')}`);
	}

	if (removed.length > 0) {
		messages.push(`Удалены разрешения: ${removed.map((p) => p.name).join(', ')}`);
	}

	return messages.join('; ') || 'Никаких изменений';
}
