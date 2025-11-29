import { eq, desc, and, sql, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, machines, products, inventory, tasks, 
  components, componentHistory, transactions, suppliers, stockTransfers,
  accessRequests, InsertAccessRequest, accessRequestAuditLogs, InsertAccessRequestAuditLog,
  roleChanges, digestConfig
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "telegramId"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (user.twoFactorEnabled !== undefined) {
      values.twoFactorEnabled = user.twoFactorEnabled;
      updateSet.twoFactorEnabled = user.twoFactorEnabled;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Machines
export async function getAllMachines() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(machines).orderBy(desc(machines.createdAt));
}

export async function getMachineById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(machines).where(eq(machines.id, id)).limit(1);
  return result[0] || null;
}

// Products
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).orderBy(desc(products.createdAt));
}

// Inventory
export async function getInventoryByLevel(level: "warehouse" | "operator" | "machine") {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(inventory).where(eq(inventory.level, level));
}

export async function getInventoryWithProducts(level: "warehouse" | "operator" | "machine") {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: inventory.id,
      productId: inventory.productId,
      level: inventory.level,
      locationId: inventory.locationId,
      quantity: inventory.quantity,
      updatedAt: inventory.updatedAt,
      productName: products.name,
      productSku: products.sku,
      productUnit: products.unit,
    })
    .from(inventory)
    .leftJoin(products, eq(inventory.productId, products.id))
    .where(eq(inventory.level, level));
  
  return result;
}

// Tasks
export async function getAllTasks() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
}

export async function getTasksByStatus(status: "pending" | "in_progress" | "completed" | "rejected") {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tasks).where(eq(tasks.status, status)).orderBy(desc(tasks.createdAt));
}

// Components
export async function getAllComponents() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(components).orderBy(desc(components.createdAt));
}

export async function getComponentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(components).where(eq(components.id, id)).limit(1);
  return result[0] || null;
}

export async function getComponentHistory(componentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(componentHistory)
    .where(eq(componentHistory.componentId, componentId))
    .orderBy(desc(componentHistory.createdAt));
}

// Transactions
export async function getRecentTransactions(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(limit);
}

export async function getTransactionsByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(transactions)
    .where(
      and(
        gte(transactions.createdAt, startDate),
        sql`${transactions.createdAt} <= ${endDate}`
      )
    )
    .orderBy(desc(transactions.createdAt));
}

// Dashboard Analytics
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const revenueResult = await db
    .select({ total: sql<number>`SUM(${transactions.amount})` })
    .from(transactions)
    .where(gte(transactions.createdAt, sevenDaysAgo));

  const machineStats = await db
    .select({
      status: machines.status,
      count: sql<number>`COUNT(*)`,
    })
    .from(machines)
    .groupBy(machines.status);

  const pendingTasksResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tasks)
    .where(eq(tasks.status, "pending"));

  return {
    totalRevenue: revenueResult[0]?.total || 0,
    machineStats: machineStats.reduce((acc, stat) => {
      acc[stat.status] = Number(stat.count);
      return acc;
    }, {} as Record<string, number>),
    pendingTasks: Number(pendingTasksResult[0]?.count || 0),
  };
}

// Suppliers
export async function getAllSuppliers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
}

// Stock Transfers
export async function getAllStockTransfers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(stockTransfers).orderBy(desc(stockTransfers.createdAt));
}

export async function createStockTransfer(data: {
  productId: number;
  requestedBy: number;
  quantity: number;
  priority: "low" | "normal" | "urgent";
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(stockTransfers).values(data);
}

// Access Requests
export async function createAccessRequest(data: InsertAccessRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(accessRequests).values(data);
  return result;
}

export async function getAllAccessRequests() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(accessRequests).orderBy(desc(accessRequests.createdAt));
}

export async function getPendingAccessRequests() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(accessRequests).where(eq(accessRequests.status, "pending")).orderBy(desc(accessRequests.createdAt));
}

export async function getAccessRequestByTelegramId(telegramId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(accessRequests).where(eq(accessRequests.telegramId, telegramId)).limit(1);
  return result[0] || null;
}

export async function approveAccessRequest(id: number, approvedBy: number, role?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status: "approved", approvedBy, approvedAt: new Date() };
  if (role) {
    updateData.requestedRole = role;
  }
  
  await db.update(accessRequests)
    .set(updateData)
    .where(eq(accessRequests.id, id));
  
  // Create audit log entry
  await createAuditLog({
    accessRequestId: id,
    action: "approved",
    performedBy: approvedBy,
    assignedRole: role as "operator" | "manager" | "admin" | undefined,
  });
}

export async function rejectAccessRequest(id: number, approvedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(accessRequests)
    .set({ status: "rejected", approvedBy, approvedAt: new Date() })
    .where(eq(accessRequests.id, id));
  
  // Create audit log entry
  await createAuditLog({
    accessRequestId: id,
    action: "rejected",
    performedBy: approvedBy,
  });
}

export async function createAuditLog(log: Omit<InsertAccessRequestAuditLog, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get performer's name from users table
  const performer = await db.select({ name: users.name }).from(users).where(eq(users.id, log.performedBy)).limit(1);
  const performedByName = performer[0]?.name || "Unknown";
  
  await db.insert(accessRequestAuditLogs).values({
    ...log,
    performedByName,
  });
}

export async function getAuditLogsByRequestId(accessRequestId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(accessRequestAuditLogs)
    .where(eq(accessRequestAuditLogs.accessRequestId, accessRequestId))
    .orderBy(desc(accessRequestAuditLogs.createdAt));
}

export async function getAllAuditLogs(startDate?: string, endDate?: string, actionType?: "approved" | "rejected") {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(accessRequestAuditLogs);
  const conditions: any[] = [];
  
  // Apply date filtering if provided
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set end date to end of day
    end.setHours(23, 59, 59, 999);
    
    conditions.push(
      gte(accessRequestAuditLogs.createdAt, start),
      sql`${accessRequestAuditLogs.createdAt} <= ${end}`
    );
  } else if (startDate) {
    const start = new Date(startDate);
    conditions.push(gte(accessRequestAuditLogs.createdAt, start));
  } else if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(sql`${accessRequestAuditLogs.createdAt} <= ${end}`);
  }
  
  // Apply action type filtering if provided
  if (actionType) {
    conditions.push(eq(accessRequestAuditLogs.action, actionType));
  }
  
  // Apply all conditions if any exist
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return await query.orderBy(desc(accessRequestAuditLogs.createdAt));
}

/**
 * Create a role change log entry
 */
export async function createRoleChange(
  userId: number,
  userName: string | null,
  oldRole: string,
  newRole: string,
  changedBy: number,
  changedByName: string | null,
  reason?: string
) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(roleChanges).values({
    userId,
    userName,
    oldRole: oldRole as any,
    newRole: newRole as any,
    changedBy,
    changedByName,
    reason,
  });
  
  return result;
}

/**
 * Get all role changes
 */
export async function getAllRoleChanges() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(roleChanges).orderBy(desc(roleChanges.createdAt));
}

/**
 * Get role changes for a specific user
 */
export async function getRoleChangesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(roleChanges)
    .where(eq(roleChanges.userId, userId))
    .orderBy(desc(roleChanges.createdAt));
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0] || null;
}

/**
 * Update user role
 */
export async function updateUserRole(userId: number, newRole: string) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(users)
    .set({ role: newRole as any })
    .where(eq(users.id, userId));
  
  return true;
}

/**
 * Get all users
 */
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

/**
 * Get digest configuration
 */
export async function getDigestConfig() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(digestConfig).limit(1);
  return result[0] || null;
}

/**
 * Update digest configuration
 */
export async function updateDigestConfig(config: {
  enabled: boolean;
  frequency: "daily" | "weekly";
  recipients: string[];
}) {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await getDigestConfig();
  const recipientsJson = JSON.stringify(config.recipients);
  
  if (existing) {
    await db.update(digestConfig)
      .set({
        enabled: config.enabled,
        frequency: config.frequency,
        recipients: recipientsJson,
      })
      .where(eq(digestConfig.id, existing.id));
  } else {
    await db.insert(digestConfig).values({
      enabled: config.enabled,
      frequency: config.frequency,
      recipients: recipientsJson,
    });
  }
  
  return true;
}

/**
 * Update user notification preferences
 */
export async function updateNotificationPreferences(
  userId: number,
  emailNotifications: boolean,
  telegramNotifications: boolean
) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(users)
    .set({ emailNotifications, telegramNotifications })
    .where(eq(users.id, userId));
  
  return true;
}

/**
 * Get user notification preferences
 */
export async function getNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const user = await getUserById(userId);
  if (!user) return null;
  
  return {
    emailNotifications: user.emailNotifications,
    telegramNotifications: user.telegramNotifications,
  };
}

/**
 * Get user by Telegram ID
 */
export async function getUserByTelegramId(telegramId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1);
  return result[0] || null;
}
