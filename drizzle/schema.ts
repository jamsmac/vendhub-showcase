import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "manager", "operator"]).default("user").notNull(),
  telegramId: varchar("telegramId", { length: 64 }),
  twoFactorEnabled: boolean("twoFactorEnabled").default(false).notNull(),
  emailNotifications: boolean("emailNotifications").default(true).notNull(),
  telegramNotifications: boolean("telegramNotifications").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Vending machines
 */
export const machines = mysqlTable("machines", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  serialNumber: varchar("serialNumber", { length: 100 }).unique(),
  model: varchar("model", { length: 100 }),
  location: text("location").notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  status: mysqlEnum("status", ["online", "offline", "maintenance"]).default("offline").notNull(),
  lastMaintenance: timestamp("lastMaintenance"),
  nextServiceDue: timestamp("nextServiceDue"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Machine = typeof machines.$inferSelect;
export type InsertMachine = typeof machines.$inferInsert;

/**
 * Products/Ingredients
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).unique(),
  category: varchar("category", { length: 100 }),
  unit: varchar("unit", { length: 50 }).notNull(),
  costPrice: int("costPrice").notNull(),
  sellingPrice: int("sellingPrice").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Inventory levels (3-level system)
 */
export const inventory = mysqlTable("inventory", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  level: mysqlEnum("level", ["warehouse", "operator", "machine"]).notNull(),
  locationId: int("locationId"),
  quantity: int("quantity").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;

/**
 * Tasks
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  machineId: int("machineId").notNull(),
  assignedTo: int("assignedTo"),
  type: mysqlEnum("type", ["refill", "maintenance", "cleaning"]).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "rejected"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "urgent"]).default("normal").notNull(),
  description: text("description"),
  beforePhotoUrl: text("beforePhotoUrl"),
  afterPhotoUrl: text("afterPhotoUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Components
 */
export const components = mysqlTable("components", {
  id: int("id").autoincrement().primaryKey(),
  serialNumber: varchar("serialNumber", { length: 100 }).unique().notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }),
  status: mysqlEnum("status", ["operational", "maintenance", "repair", "retired"]).default("operational").notNull(),
  currentMachineId: int("currentMachineId"),
  installationDate: timestamp("installationDate"),
  nextServiceDue: timestamp("nextServiceDue"),
  healthScore: int("healthScore").default(100),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Component = typeof components.$inferSelect;
export type InsertComponent = typeof components.$inferInsert;

/**
 * Component lifecycle events
 */
export const componentHistory = mysqlTable("componentHistory", {
  id: int("id").autoincrement().primaryKey(),
  componentId: int("componentId").notNull(),
  eventType: mysqlEnum("eventType", ["installation", "removal", "repair", "maintenance", "purchase"]).notNull(),
  machineId: int("machineId"),
  performedBy: int("performedBy"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ComponentHistory = typeof componentHistory.$inferSelect;
export type InsertComponentHistory = typeof componentHistory.$inferInsert;

/**
 * Transactions
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  machineId: int("machineId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull().default(1),
  amount: int("amount").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Suppliers
 */
export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contactPerson", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

/**
 * Stock transfer requests
 */
export const stockTransfers = mysqlTable("stockTransfers", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  requestedBy: int("requestedBy").notNull(),
  quantity: int("quantity").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "urgent"]).default("normal").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "completed"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StockTransfer = typeof stockTransfers.$inferSelect;
export type InsertStockTransfer = typeof stockTransfers.$inferInsert;

/**
 * Telegram access requests
 */
export const accessRequests = mysqlTable("accessRequests", {
  id: int("id").autoincrement().primaryKey(),
  telegramId: varchar("telegramId", { length: 64 }).notNull().unique(),
  username: varchar("username", { length: 255 }),
  firstName: varchar("firstName", { length: 255 }),
  lastName: varchar("lastName", { length: 255 }),
  email: varchar("email", { length: 320 }),
  chatId: varchar("chatId", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  requestedRole: mysqlEnum("requestedRole", ["operator", "manager"]).default("operator").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AccessRequest = typeof accessRequests.$inferSelect;
export type InsertAccessRequest = typeof accessRequests.$inferInsert;

/**
 * Access request audit logs
 */
export const accessRequestAuditLogs = mysqlTable("accessRequestAuditLogs", {
  id: int("id").autoincrement().primaryKey(),
  accessRequestId: int("accessRequestId").notNull(),
  action: mysqlEnum("action", ["approved", "rejected"]).notNull(),
  performedBy: int("performedBy").notNull(),
  performedByName: varchar("performedByName", { length: 255 }),
  assignedRole: mysqlEnum("assignedRole", ["operator", "manager", "admin"]),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AccessRequestAuditLog = typeof accessRequestAuditLogs.$inferSelect;
export type InsertAccessRequestAuditLog = typeof accessRequestAuditLogs.$inferInsert;

/**
 * Role change history
 * Tracks when user roles are modified after initial approval
 */
export const roleChanges = mysqlTable("roleChanges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  userName: varchar("userName", { length: 255 }),
  oldRole: mysqlEnum("oldRole", ["user", "operator", "manager", "admin"]).notNull(),
  newRole: mysqlEnum("newRole", ["user", "operator", "manager", "admin"]).notNull(),
  changedBy: int("changedBy").notNull(),
  changedByName: varchar("changedByName", { length: 255 }),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RoleChange = typeof roleChanges.$inferSelect;
export type InsertRoleChange = typeof roleChanges.$inferInsert;

/**
 * Digest configuration
 * Stores email digest settings
 */
export const digestConfig = mysqlTable("digestConfig", {
  id: int("id").autoincrement().primaryKey(),
  enabled: boolean("enabled").default(true).notNull(),
  frequency: mysqlEnum("frequency", ["daily", "weekly"]).default("daily").notNull(),
  recipients: text("recipients").notNull(), // JSON array of email addresses
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DigestConfig = typeof digestConfig.$inferSelect;
export type InsertDigestConfig = typeof digestConfig.$inferInsert;