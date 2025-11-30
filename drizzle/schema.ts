import { mysqlTable, mysqlSchema, AnyMySqlColumn, int, mysqlEnum, varchar, text, timestamp, index, uniqueIndex, boolean, decimal } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const accessRequestAuditLogs = mysqlTable("accessRequestAuditLogs", {
	id: int().autoincrement().notNull(),
	accessRequestId: int().notNull(),
	action: mysqlEnum(['approved','rejected']).notNull(),
	performedBy: int().notNull(),
	performedByName: varchar({ length: 255 }),
	assignedRole: mysqlEnum(['operator','manager','admin']),
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const accessRequests = mysqlTable("accessRequests", {
	id: int().autoincrement().notNull(),
	telegramId: varchar({ length: 64 }).notNull(),
	username: varchar({ length: 255 }),
	firstName: varchar({ length: 255 }),
	lastName: varchar({ length: 255 }),
	chatId: varchar({ length: 64 }).notNull(),
	status: mysqlEnum(['pending','approved','rejected']).default('pending').notNull(),
	requestedRole: mysqlEnum(['operator','manager']).default('operator').notNull(),
	approvedBy: int(),
	approvedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	adminNotes: text(),
	email: varchar({ length: 320 }),
},
(table) => [
	index("accessRequests_telegramId_unique").on(table.telegramId),
]);

export const componentHistory = mysqlTable("componentHistory", {
	id: int().autoincrement().notNull(),
	componentId: int().notNull(),
	eventType: mysqlEnum(['installation','removal','repair','maintenance','purchase']).notNull(),
	machineId: int(),
	performedBy: int(),
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const components = mysqlTable("components", {
	id: int().autoincrement().notNull(),
	serialNumber: varchar({ length: 100 }).notNull(),
	type: varchar({ length: 100 }),
	model: varchar({ length: 100 }),
	status: mysqlEnum(['operational','maintenance','repair','retired']).default('operational').notNull(),
	currentMachineId: int(),
	installationDate: timestamp({ mode: 'string' }),
	nextServiceDue: timestamp({ mode: 'string' }),
	healthScore: int().default(100),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("components_serialNumber_unique").on(table.serialNumber),
]);

export const digestConfig = mysqlTable("digestConfig", {
	id: int().autoincrement().notNull(),
	enabled: boolean().default(true).notNull(),
	frequency: mysqlEnum(['daily','weekly']).default('daily').notNull(),
	recipients: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const inventory = mysqlTable("inventory", {
	id: int("id").autoincrement().notNull(),
	productId: int("product_id").notNull(),
	level: mysqlEnum("level", ['warehouse','operator','machine']).notNull(),
	locationId: int("location_id"),
	quantity: int("quantity").default(0).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const inventoryAdjustments = mysqlTable("inventoryAdjustments", {
	id: int().autoincrement().notNull(),
	inventoryId: int().notNull(),
	productId: int().notNull(),
	adjustmentType: mysqlEnum(['damage','shrinkage','correction','found','expired','returned']).notNull(),
	quantityBefore: int().notNull(),
	quantityAfter: int().notNull(),
	quantityChange: int().notNull(),
	reason: text().notNull(),
	photoUrl: text(),
	performedBy: int().notNull(),
	performedByName: varchar({ length: 255 }),
	level: mysqlEnum(['warehouse','operator','machine']).notNull(),
	locationId: int(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const machines = mysqlTable("machines", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	serialNumber: varchar('serial_number', { length: 100 }),
	model: varchar({ length: 100 }),
	location: text().notNull(),
	latitude: varchar({ length: 50 }),
	longitude: varchar({ length: 50 }),
	status: mysqlEnum(['online','offline','maintenance']).default('offline').notNull(),
	lastMaintenance: timestamp('last_maintenance', { mode: 'string' }),
	nextServiceDue: timestamp('next_service_due', { mode: 'string' }),
	createdAt: timestamp('created_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp('updated_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	index("machines_serial_number_unique").on(table.serialNumber),
]);

export const products = mysqlTable("products", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	sku: varchar({ length: 100 }),
	category: varchar({ length: 100 }),
	unit: varchar({ length: 50 }).notNull(),
	costPrice: int('cost_price').notNull(),
	sellingPrice: int('selling_price').notNull(),
	createdAt: timestamp({ mode: 'string', fsp: 3 }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string', fsp: 3 }).defaultNow().onUpdateNow().notNull(),
},
(table) => ([
	index("products_sku_unique").on(table.sku),
]));

export const roleChanges = mysqlTable("roleChanges", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	userName: varchar({ length: 255 }),
	oldRole: mysqlEnum(['user','operator','manager','admin']).notNull(),
	newRole: mysqlEnum(['user','operator','manager','admin']).notNull(),
	changedBy: int().notNull(),
	changedByName: varchar({ length: 255 }),
	reason: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const stockTransfers = mysqlTable("stockTransfers", {
	id: int().autoincrement().notNull(),
	productId: int().notNull(),
	requestedBy: int().notNull(),
	quantity: int().notNull(),
	priority: mysqlEnum(['low','normal','urgent']).default('normal').notNull(),
	status: mysqlEnum(['pending','approved','rejected','completed']).default('pending').notNull(),
	notes: text(),
	approvedBy: int(),
	approvedAt: timestamp({ mode: 'string' }),
	rejectedBy: int(),
	rejectedAt: timestamp({ mode: 'string' }),
	fromLevel: mysqlEnum(['warehouse','operator','machine']),
	toLevel: mysqlEnum(['warehouse','operator','machine']),
	fromLocationId: int(),
	toLocationId: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const suppliers = mysqlTable("suppliers", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	contactPerson: varchar({ length: 255 }),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 50 }),
	address: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const tasks = mysqlTable("tasks", {
	id: int().autoincrement().notNull(),
	machineId: int('machineId').notNull(),
	assignedTo: int('assignedTo'),
	type: mysqlEnum(['refill','maintenance','cleaning']).notNull(),
	status: mysqlEnum(['pending','in_progress','completed','rejected']).default('pending').notNull(),
	priority: mysqlEnum(['low','normal','urgent']).default('normal').notNull(),
	description: text(),
	beforePhotoUrl: text('beforePhotoUrl'),
	afterPhotoUrl: text('afterPhotoUrl'),
	createdAt: timestamp('createdAt', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	completedAt: timestamp('completedAt', { mode: 'string' }),
	updatedAt: timestamp('updatedAt', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
});

export const transactions = mysqlTable("transactions", {
	id: int().autoincrement().notNull(),
	machineId: int().notNull(),
	productId: int().notNull(),
	quantity: int().default(1).notNull(),
	amount: int().notNull(),
	paymentMethod: varchar({ length: 50 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	openId: varchar({ length: 64 }).notNull(),
	name: text(),
	email: varchar({ length: 320 }),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user','admin','manager','operator']).default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	telegramId: varchar({ length: 64 }),
	passwordHash: varchar({ length: 255 }),
	twoFactorEnabled: boolean().default(false).notNull(),
	emailNotifications: boolean().default(true).notNull(),
	telegramNotifications: boolean().default(true).notNull(),
	status: mysqlEnum(['active','suspended','inactive']).default('active').notNull(),
	suspendedAt: timestamp({ mode: 'string' }),
	suspendedReason: text(),
	suspendedBy: int(),
	},
	(table) => [
		index("users_openId_unique").on(table.openId),
		index("users_status_index").on(table.status),
	]);

export const taskPhotos = mysqlTable("taskPhotos", {
	id: int().autoincrement().notNull(),
	taskId: int().notNull(),
	photoUrl: text().notNull(),
	photoType: mysqlEnum(['before','after']).notNull(),
	fileSize: int(),
	fileMimeType: varchar({ length: 100 }),
	validationStatus: mysqlEnum(['pending','approved','rejected']).default('pending').notNull(),
	validatedBy: int(),
	validationNotes: text(),
	uploadedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	validatedAt: timestamp({ mode: 'string' }),
});

export const inventoryAuditTrail = mysqlTable("inventoryAuditTrail", {
	id: int().autoincrement().notNull(),
	machineId: int().notNull(),
	productId: int(),
	quantityBefore: int(),
	quantityAfter: int(),
	quantityChange: int().notNull(),
	operationType: mysqlEnum(['refill','removal','adjustment','inventory_count']).notNull(),
	operator: int().notNull(),
	operatorName: varchar({ length: 255 }),
	taskId: int(),
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const machineConnectivity = mysqlTable("machineConnectivity", {
	id: int().autoincrement().notNull(),
	machineId: int().notNull(),
	status: mysqlEnum(['online','offline']).notNull(),
	lastHeartbeat: timestamp({ mode: 'string' }),
	offlineSince: timestamp({ mode: 'string' }),
	incidentCreated: boolean().default(false).notNull(),
	incidentId: int(),
	checkedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const incidents = mysqlTable("incidents", {
	id: int().autoincrement().notNull(),
	machineId: int().notNull(),
	incidentType: mysqlEnum(['offline','malfunction','low_stock','temperature_alert','payment_error']).notNull(),
	status: mysqlEnum(['open','in_progress','resolved','closed']).default('open').notNull(),
	severity: mysqlEnum(['low','medium','high','critical']).default('medium').notNull(),
	description: text(),
	detectedAt: timestamp({ mode: 'string', fsp: 3 }).defaultNow().notNull(),
	assignedTo: int(),
	resolvedAt: timestamp({ mode: 'string', fsp: 3 }),
	resolutionNotes: text(),
	createdAt: timestamp({ mode: 'string', fsp: 3 }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string', fsp: 3 }).defaultNow().onUpdateNow().notNull(),
});

// AI-Agent System Tables
export const aiAgents = mysqlTable("aiAgents", {
  id: int().autoincrement().primaryKey(),
  referenceBookType: varchar({ length: 50 }).notNull().unique(),
  displayName: varchar({ length: 255 }).notNull(),
  systemPrompt: text().notNull(),
  status: mysqlEnum(['active', 'inactive', 'archived']).default('active').notNull(),
  version: int().default(1),
  createdBy: int().notNull(),
  updatedBy: int(),
  createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
});

export const aiSuggestions = mysqlTable("aiSuggestions", {
  id: int().autoincrement().primaryKey(),
  agentId: int().notNull(),
  referenceBookId: int(),
  inputData: text().notNull(),
  suggestedFields: text().notNull(),
  confidence: decimal({ precision: 3, scale: 2 }),
  confirmed: boolean().default(false),
  confirmedBy: int(),
  confirmedAt: timestamp({ mode: 'string' }),
  rejectedReason: text(),
  createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const aiImprovements = mysqlTable("aiImprovements", {
  id: int().autoincrement().primaryKey(),
  agentId: int().notNull(),
  proposedPrompt: text().notNull(),
  proposedChanges: text().notNull(),
  reasoning: text(),
  status: mysqlEnum(['pending', 'approved', 'rejected']).default('pending').notNull(),
  approvedBy: int(),
  approvedAt: timestamp({ mode: 'string' }),
  rejectionReason: text(),
  createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const aiLearningData = mysqlTable("aiLearningData", {
  id: int().autoincrement().primaryKey(),
  agentId: int().notNull(),
  fieldName: varchar({ length: 100 }),
  inputPattern: varchar({ length: 255 }),
  suggestedValue: varchar({ length: 255 }),
  confirmationRate: decimal({ precision: 3, scale: 2 }),
  rejectionRate: decimal({ precision: 3, scale: 2 }),
  lastUsed: timestamp({ mode: 'string' }),
});

export const notifications = mysqlTable("notifications", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	type: mysqlEnum(['transfer_approved','transfer_rejected','low_stock','task_assigned','system']).notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	relatedId: int(),
	relatedType: varchar({ length: 50 }),
	read: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Type exports for database operations
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type AccessRequest = typeof accessRequests.$inferSelect;
export type InsertAccessRequest = typeof accessRequests.$inferInsert;

export type AccessRequestAuditLog = typeof accessRequestAuditLogs.$inferSelect;
export type InsertAccessRequestAuditLog = typeof accessRequestAuditLogs.$inferInsert;

export type Machine = typeof machines.$inferSelect;
export type InsertMachine = typeof machines.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export type StockTransfer = typeof stockTransfers.$inferSelect;
export type InsertStockTransfer = typeof stockTransfers.$inferInsert;
export type InventoryAdjustment = typeof inventoryAdjustments.$inferSelect;
export type InsertInventoryAdjustment = typeof inventoryAdjustments.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Dictionary Items - Reference book entries with multilingual support
export const dictionaryItems = mysqlTable("dictionaryItems", {
	id: int().autoincrement().notNull().primaryKey(),
	dictionaryCode: varchar({ length: 100 }).notNull(),
	code: varchar({ length: 100 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	name_en: varchar({ length: 255 }),
	name_ru: varchar({ length: 255 }),
	name_uz: varchar({ length: 255 }),
	description: text(),
	description_en: text(),
	description_ru: text(),
	description_uz: text(),
	icon: varchar({ length: 255 }),
	color: varchar({ length: 7 }),
	symbol: varchar({ length: 10 }),
	sort_order: int().default(0).notNull(),
	is_active: boolean().default(true).notNull(),
	createdBy: int(),
	updatedBy: int(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
	}, (table) => [
		uniqueIndex("dictionaryItems_dictionaryCode_code_unique").on(table.dictionaryCode, table.code),
		index("dictionaryItems_dictionaryCode").on(table.dictionaryCode),
		index("dictionaryItems_is_active").on(table.is_active),
	]);

export type DictionaryItem = typeof dictionaryItems.$inferSelect;
export type InsertDictionaryItem = typeof dictionaryItems.$inferInsert;

// Import History & Batch Operations
export const importHistory = mysqlTable("importHistory", {
	id: int().autoincrement().notNull().primaryKey(),
	dictionaryCode: varchar({ length: 100 }).notNull(),
	fileName: varchar({ length: 255 }).notNull(),
	totalRecords: int().default(0).notNull(),
	successfulRecords: int().default(0).notNull(),
	failedRecords: int().default(0).notNull(),
	status: mysqlEnum(['pending', 'in_progress', 'completed', 'failed', 'rolled_back']).default('pending').notNull(),
	importMode: mysqlEnum(['create', 'update', 'upsert']).default('create').notNull(),
	performedBy: int().notNull(),
	errorLog: text(),
	rolledBackAt: timestamp({ mode: 'string' }),
	rolledBackBy: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const batchTransactions = mysqlTable("batchTransactions", {
	id: int().autoincrement().notNull().primaryKey(),
	importHistoryId: int().notNull(),
	recordIndex: int().notNull(),
	originalData: text().notNull(),
	modifiedData: text().notNull(),
	operation: mysqlEnum(['insert', 'update', 'delete']).notNull(),
	status: mysqlEnum(['pending', 'success', 'failed']).default('pending').notNull(),
	errorMessage: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const undoRedoStack = mysqlTable("undoRedoStack", {
	id: int().autoincrement().notNull().primaryKey(),
	importHistoryId: int().notNull(),
	action: mysqlEnum(['import', 'rollback']).notNull(),
	previousState: text(),
	newState: text(),
	timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	performedBy: int().notNull(),
});

export type ImportHistory = typeof importHistory.$inferSelect;
export type InsertImportHistory = typeof importHistory.$inferInsert;

export type BatchTransaction = typeof batchTransactions.$inferSelect;
export type InsertBatchTransaction = typeof batchTransactions.$inferInsert;

export type UndoRedoStack = typeof undoRedoStack.$inferSelect;
export type InsertUndoRedoStack = typeof undoRedoStack.$inferInsert;


export const sessions = mysqlTable("sessions", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	token: varchar({ length: 500 }).notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
},
(table) => [
	index("sessions_userId_index").on(table.userId),
	index("sessions_token_unique").on(table.token),
]);

export const passwordRecovery = mysqlTable("passwordRecovery", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	token: varchar({ length: 500 }).notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	usedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("passwordRecovery_userId_index").on(table.userId),
	index("passwordRecovery_token_unique").on(table.token),
]);

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export type PasswordRecovery = typeof passwordRecovery.$inferSelect;
export type InsertPasswordRecovery = typeof passwordRecovery.$inferInsert;


/**
 * Activity Logs - Track all user actions for security and compliance
 */
export const activityLogs = mysqlTable(
	"activityLogs",
	{
		id: int().autoincrement().notNull(),
		userId: int(),
		action: varchar({ length: 50 }).notNull(), // 'login', 'logout', 'api_call', 'data_access', 'role_change', etc.
		resource: varchar({ length: 100 }), // What was accessed (e.g., 'users', 'machines', 'inventory')
		resourceId: int(), // ID of the resource being accessed
		method: varchar({ length: 20 }), // HTTP method: GET, POST, PUT, DELETE
		endpoint: varchar({ length: 255 }), // API endpoint or page path
		status: varchar({ length: 20 }), // 'success', 'failure', 'unauthorized', 'forbidden'
		statusCode: int(), // HTTP status code
		ipAddress: varchar({ length: 45 }), // IPv4 or IPv6 address
		userAgent: text(), // Browser/client information
		referer: varchar({ length: 255 }), // HTTP referer
		requestBody: text(), // Sanitized request body (exclude passwords)
		responseSize: int(), // Size of response in bytes
		duration: int(), // Request duration in milliseconds
		errorMessage: text(), // Error message if action failed
		metadata: text(), // Additional metadata as JSON
		createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	},
	(table) => [
		index("activityLogs_userId_index").on(table.userId),
		index("activityLogs_action_index").on(table.action),
		index("activityLogs_createdAt_index").on(table.createdAt),
		index("activityLogs_ipAddress_index").on(table.ipAddress),
		index("activityLogs_endpoint_index").on(table.endpoint),
		index("activityLogs_resource_index").on(table.resource),
	]
);

/**
 * Login Attempts - Track all login attempts for security monitoring
 */
export const loginAttempts = mysqlTable(
	"loginAttempts",
	{
		id: int().autoincrement().notNull(),
		userId: int(),
		email: varchar({ length: 320 }),
		ipAddress: varchar({ length: 45 }).notNull(),
		userAgent: text(),
		status: mysqlEnum(['success', 'failed', 'locked']).notNull(),
		failureReason: varchar({ length: 255 }), // 'invalid_password', 'user_not_found', 'account_suspended', etc.
		attemptNumber: int().default(1), // Number of failed attempts from this IP
		lockoutUntil: timestamp({ mode: 'string' }), // When the account/IP is locked until
		createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	},
	(table) => [
		index("loginAttempts_userId_index").on(table.userId),
		index("loginAttempts_ipAddress_index").on(table.ipAddress),
		index("loginAttempts_createdAt_index").on(table.createdAt),
		index("loginAttempts_email_index").on(table.email),
	]
);

/**
 * Suspicious Activities - Flagged activities for security review
 */
export const suspiciousActivities = mysqlTable(
	"suspiciousActivities",
	{
		id: int().autoincrement().notNull(),
		activityLogId: int(),
		userId: int(),
		activityType: mysqlEnum([
			'multiple_failed_logins',
			'unusual_location',
			'unusual_time',
			'bulk_data_access',
			'permission_escalation_attempt',
			'api_rate_limit_exceeded',
			'unauthorized_access_attempt',
			'data_export',
			'mass_user_modification',
		]).notNull(),
		severity: mysqlEnum(['low', 'medium', 'high', 'critical']).notNull(),
		description: text().notNull(),
		ipAddress: varchar({ length: 45 }),
		reviewed: boolean().default(false).notNull(),
		reviewedBy: int(),
		reviewedAt: timestamp({ mode: 'string' }),
		reviewNotes: text(),
		action: mysqlEnum(['none', 'warning', 'suspend', 'investigate']).default('none').notNull(),
		createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	},
	(table) => [
		index("suspiciousActivities_userId_index").on(table.userId),
		index("suspiciousActivities_severity_index").on(table.severity),
		index("suspiciousActivities_reviewed_index").on(table.reviewed),
		index("suspiciousActivities_createdAt_index").on(table.createdAt),
	]
);

/**
 * API Rate Limits - Track API usage for rate limiting
 */
export const apiRateLimits = mysqlTable(
	"apiRateLimits",
	{
		id: int().autoincrement().notNull(),
		userId: int(),
		ipAddress: varchar({ length: 45 }).notNull(),
		endpoint: varchar({ length: 255 }).notNull(),
		requestCount: int().default(1).notNull(),
		windowStart: timestamp({ mode: 'string' }).notNull(),
		windowEnd: timestamp({ mode: 'string' }).notNull(),
		limitExceeded: boolean().default(false).notNull(),
		createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	},
	(table) => [
		index("apiRateLimits_userId_index").on(table.userId),
		index("apiRateLimits_ipAddress_index").on(table.ipAddress),
		index("apiRateLimits_endpoint_index").on(table.endpoint),
		index("apiRateLimits_windowStart_index").on(table.windowStart),
	]
);

/**
 * Data Access Logs - Track access to sensitive data
 */
export const dataAccessLogs = mysqlTable(
	"dataAccessLogs",
	{
		id: int().autoincrement().notNull(),
		userId: int().notNull(),
		dataType: varchar({ length: 100 }).notNull(), // 'user_data', 'financial_data', 'machine_data', etc.
		dataId: int(),
		action: mysqlEnum(['view', 'create', 'update', 'delete', 'export']).notNull(),
		ipAddress: varchar({ length: 45 }).notNull(),
		reason: varchar({ length: 255 }), // Why the user accessed this data
		approved: boolean().default(true).notNull(),
		approvedBy: int(),
		createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	},
	(table) => [
		index("dataAccessLogs_userId_index").on(table.userId),
		index("dataAccessLogs_dataType_index").on(table.dataType),
		index("dataAccessLogs_createdAt_index").on(table.createdAt),
		index("dataAccessLogs_action_index").on(table.action),
	]
);

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type InsertLoginAttempt = typeof loginAttempts.$inferInsert;

export type SuspiciousActivity = typeof suspiciousActivities.$inferSelect;
export type InsertSuspiciousActivity = typeof suspiciousActivities.$inferInsert;

export type ApiRateLimit = typeof apiRateLimits.$inferSelect;
export type InsertApiRateLimit = typeof apiRateLimits.$inferInsert;

export type DataAccessLog = typeof dataAccessLogs.$inferSelect;
export type InsertDataAccessLog = typeof dataAccessLogs.$inferInsert;


/**
 * Permissions - Define granular permissions for the system
 */
export const permissions = mysqlTable(
	"permissions",
	{
		id: int().autoincrement().notNull(),
		key: varchar({ length: 100 }).notNull().unique(), // 'users.view', 'users.create', 'machines.edit', etc.
		name: varchar({ length: 255 }).notNull(), // Human-readable name
		description: text(), // What this permission allows
		category: varchar({ length: 50 }).notNull(), // 'users', 'machines', 'inventory', 'reports', 'settings'
		riskLevel: mysqlEnum(['low', 'medium', 'high', 'critical']).default('low').notNull(),
		createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
		updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	},
	(table) => [
		index("permissions_key_unique").on(table.key),
		index("permissions_category_index").on(table.category),
	]
);

/**
 * Role Permissions - Map permissions to roles
 */
export const rolePermissions = mysqlTable(
	"rolePermissions",
	{
		id: int().autoincrement().notNull(),
		role: mysqlEnum(['user', 'operator', 'manager', 'admin']).notNull(),
		permissionId: int().notNull(),
		grantedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
		grantedBy: int(), // Admin who granted this permission
		notes: text(), // Why this permission was granted
	},
	(table) => [
		index("rolePermissions_role_index").on(table.role),
		index("rolePermissions_permissionId_index").on(table.permissionId),
		index("rolePermissions_role_permissionId_unique").on(table.role, table.permissionId),
	]
);

/**
 * Permission Changes - Audit log for permission modifications
 */
export const permissionChanges = mysqlTable(
	"permissionChanges",
	{
		id: int().autoincrement().notNull(),
		role: mysqlEnum(['user', 'operator', 'manager', 'admin']).notNull(),
		permissionId: int().notNull(),
		action: mysqlEnum(['granted', 'revoked']).notNull(),
		changedBy: int().notNull(), // Admin who made the change
		reason: text(), // Why the permission was changed
		createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	},
	(table) => [
		index("permissionChanges_role_index").on(table.role),
		index("permissionChanges_changedBy_index").on(table.changedBy),
		index("permissionChanges_createdAt_index").on(table.createdAt),
	]
);

/**
 * Permission Groups - Group related permissions for easier management
 */
export const permissionGroups = mysqlTable(
	"permissionGroups",
	{
		id: int().autoincrement().notNull(),
		name: varchar({ length: 255 }).notNull(), // 'User Management', 'Machine Operations', etc.
		description: text(),
		category: varchar({ length: 50 }).notNull(), // 'users', 'machines', 'inventory', 'reports', 'settings'
		createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	},
	(table) => [
		index("permissionGroups_category_index").on(table.category),
	]
);

/**
 * Permission Group Members - Link permissions to groups
 */
export const permissionGroupMembers = mysqlTable(
	"permissionGroupMembers",
	{
		id: int().autoincrement().notNull(),
		groupId: int().notNull(),
		permissionId: int().notNull(),
	},
	(table) => [
		index("permissionGroupMembers_groupId_index").on(table.groupId),
		index("permissionGroupMembers_permissionId_index").on(table.permissionId),
	]
);

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = typeof rolePermissions.$inferInsert;

export type PermissionChange = typeof permissionChanges.$inferSelect;
export type InsertPermissionChange = typeof permissionChanges.$inferInsert;

export type PermissionGroup = typeof permissionGroups.$inferSelect;
export type InsertPermissionGroup = typeof permissionGroups.$inferInsert;

export type PermissionGroupMember = typeof permissionGroupMembers.$inferSelect;
export type InsertPermissionGroupMember = typeof permissionGroupMembers.$inferInsert;


// Performance Metrics Tables
export const performanceMetrics = mysqlTable(
	'performanceMetrics',
	{
		id: int().autoincrement().notNull().primaryKey(),
		timestamp: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
		memoryUsagePercent: decimal({ precision: 5, scale: 2 }).notNull(),
		memoryUsedMB: int().notNull(),
		memoryTotalMB: int().notNull(),
		cpuUsagePercent: decimal({ precision: 5, scale: 2 }).notNull(),
		cpuCores: int().notNull(),
		cpuLoadAverage: decimal({ precision: 5, scale: 2 }).notNull(),
		diskUsagePercent: decimal({ precision: 5, scale: 2 }).notNull(),
		diskUsedGB: decimal({ precision: 10, scale: 2 }).notNull(),
		diskTotalGB: decimal({ precision: 10, scale: 2 }).notNull(),
		processCount: int().notNull(),
		staleProcessCount: int().default(0).notNull(),
		healthStatus: mysqlEnum(['healthy', 'warning', 'critical']).default('healthy').notNull(),
		issues: text(), // JSON array of issues
		uptime: int().notNull(), // in seconds
		createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	},
	(table) => [
		index('performanceMetrics_timestamp_idx').on(table.timestamp),
		index('performanceMetrics_healthStatus_idx').on(table.healthStatus),
	]
);

export const performanceMetricsHourly = mysqlTable(
	'performanceMetricsHourly',
	{
		id: int().autoincrement().notNull().primaryKey(),
		hour: timestamp({ mode: 'string' }).notNull(),
		memoryUsageAvgPercent: decimal({ precision: 5, scale: 2 }).notNull(),
		memoryUsageMaxPercent: decimal({ precision: 5, scale: 2 }).notNull(),
		memoryUsageMinPercent: decimal({ precision: 5, scale: 2 }).notNull(),
		cpuUsageAvgPercent: decimal({ precision: 5, scale: 2 }).notNull(),
		cpuUsageMaxPercent: decimal({ precision: 5, scale: 2 }).notNull(),
		cpuUsageMinPercent: decimal({ precision: 5, scale: 2 }).notNull(),
		diskUsageAvgPercent: decimal({ precision: 5, scale: 2 }).notNull(),
		diskUsageMaxPercent: decimal({ precision: 5, scale: 2 }).notNull(),
		staleProcessCountAvg: decimal({ precision: 5, scale: 2 }).notNull(),
		criticalEventsCount: int().default(0).notNull(),
		warningEventsCount: int().default(0).notNull(),
		recordCount: int().notNull(), // number of metrics aggregated
		createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	},
	(table) => [
		index('performanceMetricsHourly_hour_idx').on(table.hour),
		index('performanceMetricsHourly_createdAt_idx').on(table.createdAt),
	]
);

export const performanceMetricsDaily = mysqlTable(
	'performanceMetricsDaily',
	{
		id: int().autoincrement().notNull().primaryKey(),
		date: varchar({ length: 10 }).notNull(), // YYYY-MM-DD format
		memoryUsageAvgPercent: decimal({ precision: 5, scale: 2 }).notNull(),
		memoryUsageMaxPercent: decimal({ precision: 5, scale: 2 }).notNull(),
		cpuUsageAvgPercent: decimal({ precision: 5, scale: 2 }).notNull(),
		cpuUsageMaxPercent: decimal({ precision: 5, scale: 2 }).notNull(),
		diskUsageAvgPercent: decimal({ precision: 5, scale: 2 }).notNull(),
		diskUsageMaxPercent: decimal({ precision: 5, scale: 2 }).notNull(),
		staleProcessCountAvg: decimal({ precision: 5, scale: 2 }).notNull(),
		criticalEventsCount: int().default(0).notNull(),
		warningEventsCount: int().default(0).notNull(),
		recordCount: int().notNull(), // number of hourly metrics aggregated
		createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	},
	(table) => [
		index('performanceMetricsDaily_date_idx').on(table.date),
		index('performanceMetricsDaily_createdAt_idx').on(table.createdAt),
	]
);

export type PerformanceMetrics = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetrics = typeof performanceMetrics.$inferInsert;

export type PerformanceMetricsHourly = typeof performanceMetricsHourly.$inferSelect;
export type InsertPerformanceMetricsHourly = typeof performanceMetricsHourly.$inferInsert;

export type PerformanceMetricsDaily = typeof performanceMetricsDaily.$inferSelect;
export type InsertPerformanceMetricsDaily = typeof performanceMetricsDaily.$inferInsert;
