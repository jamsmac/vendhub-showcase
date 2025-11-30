import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { telegramRouter } from "./telegram-router";
import { notificationsRouter } from "./routers/notifications";
import { aiAgentsRouter } from "./routers/aiAgents";
import { sendEmail, getAccessRequestApprovedEmail, getAccessRequestRejectedEmail } from "./email";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  machines: router({
    list: publicProcedure.query(async () => {
      return await db.getAllMachines();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getMachineById(input.id);
      }),
  }),

  products: router({
    list: publicProcedure.query(async () => {
      return await db.getAllProducts();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        category: z.string(),
        unit: z.string().optional(),
        price: z.number().min(0),
        sku: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createProduct(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        category: z.string().optional(),
        unit: z.string().optional(),
        price: z.number().optional(),
        sku: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateProduct(id, data);
      }),
  }),

  inventory: router({
    warehouse: publicProcedure.query(async () => {
      return await db.getInventoryWithProducts("warehouse");
    }),
    operator: publicProcedure.query(async () => {
      return await db.getInventoryWithProducts("operator");
    }),
    machine: publicProcedure.query(async () => {
      return await db.getInventoryWithProducts("machine");
    }),
    getByLevel: protectedProcedure
      .input(z.object({
        level: z.enum(['warehouse', 'operator', 'machine']).optional(),
        locationId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getInventoryByLevel(input.level, input.locationId);
      }),
    getByProduct: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getInventoryByProduct(input.productId);
      }),
    getAll: protectedProcedure.query(async () => {
      return await db.getAllInventory();
    }),
    updateQuantity: protectedProcedure
      .input(z.object({
        id: z.number(),
        quantity: z.number().min(0),
      }))
      .mutation(async ({ input }) => {
        return await db.updateInventoryQuantity(input.id, input.quantity);
      }),
    getLowStockAlerts: protectedProcedure
      .input(z.object({ threshold: z.number().optional().default(10) }))
      .query(async ({ input }) => {
        return await db.getLowStockAlerts(input.threshold);
      }),
    getStats: protectedProcedure.query(async () => {
      return await db.getInventoryStats();
    }),
    getTransfers: protectedProcedure
      .input(z.object({
        status: z.enum(['pending', 'approved', 'rejected', 'completed']).optional(),
      }))
      .query(async ({ input }) => {
        return await db.getStockTransfers(input.status);
      }),
    updateTransferStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'approved', 'rejected', 'completed']),
      }))
      .mutation(async ({ input }) => {
        return await db.updateStockTransferStatus(input.id, input.status);
      }),
  }),

  tasks: router({
    list: publicProcedure.query(async () => {
      return await db.getAllTasks();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTaskById(input.id);
      }),
    byStatus: publicProcedure
      .input(z.object({ status: z.enum(["pending", "in_progress", "completed", "rejected"]) }))
      .query(async ({ input }) => {
        return await db.getTasksByStatus(input.status);
      }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        machineId: z.number().optional(),
        type: z.string(),
        priority: z.string(),
        status: z.string(),
        assignedTo: z.number().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createTask(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        machineId: z.number().optional(),
        type: z.string().optional(),
        priority: z.string().optional(),
        status: z.string().optional(),
        assignedTo: z.number().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateTask(id, data);
      }),
  }),

  components: router({
    list: publicProcedure.query(async () => {
      return await db.getAllComponents();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getComponentById(input.id);
      }),
    history: publicProcedure
      .input(z.object({ componentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getComponentHistory(input.componentId);
      }),
  }),

  transactions: router({
    recent: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getRecentTransactions(input?.limit);
      }),
    byDateRange: publicProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getTransactionsByDateRange(input.startDate, input.endDate);
      }),
  }),

  dashboard: router({
    stats: publicProcedure.query(async () => {
      return await db.getDashboardStats();
    }),
  }),

  suppliers: router({
    list: publicProcedure.query(async () => {
      return await db.getAllSuppliers();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSupplierById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        type: z.string(),
        contactPerson: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        taxId: z.string().optional(),
        bankAccount: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createSupplier(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        type: z.string().optional(),
        contactPerson: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        taxId: z.string().optional(),
        bankAccount: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateSupplier(id, data);
      }),
  }),

  telegram: telegramRouter,

  accessRequests: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllAccessRequests();
    }),
    pending: protectedProcedure.query(async () => {
      return await db.getPendingAccessRequests();
    }),
    auditLogs: protectedProcedure.query(async () => {
      return await db.getAllAuditLogs();
    }),
    auditLogsByRequestId: protectedProcedure
      .input(z.object({ requestId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAuditLogsByRequestId(input.requestId);
      }),
    approve: protectedProcedure
      .input(z.object({ id: z.number(), approvedBy: z.number(), role: z.string().optional() }))
      .mutation(async ({ input }) => {
        await db.approveAccessRequest(input.id, input.approvedBy, input.role);
        
        // Get request details to send notifications
        const requests = await db.getAllAccessRequests();
        const request = requests.find(r => r.id === input.id);
        
        if (request) {
          // Send Telegram notification
          if (request.chatId) {
            const { sendMessage } = await import('./telegram');
            await sendMessage(parseInt(request.chatId), `✅ **Ваша заявка одобрена!**

Поздравляем! Вам предоставлен доступ к VendHub Manager.

🔗 **Войти в систему:**
${process.env.PUBLIC_URL || 'https://vendhub-showcase.manus.space'}

Используйте свой Telegram аккаунт для входа.`);
          }
          
          // Send Email notification if user has enabled it
          const userPrefs = request.telegramId ? await db.getUserByTelegramId(request.telegramId) : null;
          if (request.email && (!userPrefs || userPrefs.emailNotifications)) {
            await sendEmail({
              to: request.email,
              subject: "Заявка на доступ одобрена - VendHub Manager",
              html: getAccessRequestApprovedEmail({
                firstName: request.firstName || "Пользователь",
                role: input.role || request.requestedRole,
              }),
            });
          }
        }
        
        return { success: true };
      }),
    updateNotes: protectedProcedure
      .input(z.object({ id: z.number(), notes: z.string() }))
      .mutation(async ({ input }) => {
        const db = await import('./db');
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");
        
        const { accessRequests } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        
        await dbInstance.update(accessRequests)
          .set({ adminNotes: input.notes })
          .where(eq(accessRequests.id, input.id));
        
        return { success: true };
      }),
    reject: protectedProcedure
      .input(z.object({ id: z.number(), approvedBy: z.number() }))
      .mutation(async ({ input }) => {
        await db.rejectAccessRequest(input.id, input.approvedBy);
        
        // Get request details to send notifications
        const requests = await db.getAllAccessRequests();
        const request = requests.find(r => r.id === input.id);
        
        if (request) {
          // Send Telegram notification
          if (request.chatId) {
            const { sendMessage } = await import('./telegram');
            await sendMessage(parseInt(request.chatId), `❌ **Ваша заявка отклонена**

К сожалению, ваша заявка на доступ к VendHub Manager была отклонена.

Для уточнения причин обратитесь к администратору.`);
          }
          
          // Send Email notification if user has enabled it
          const userPrefs = request.telegramId ? await db.getUserByTelegramId(request.telegramId) : null;
          if (request.email && (!userPrefs || userPrefs.emailNotifications)) {
            await sendEmail({
              to: request.email,
              subject: "Заявка на доступ отклонена - VendHub Manager",
              html: getAccessRequestRejectedEmail({
                firstName: request.firstName || "Пользователь",
                reason: request.adminNotes || undefined,
              }),
            });
          }
        }
        
        return { success: true };
      }),
  }),

  auditLogs: router({
    list: protectedProcedure
      .input(z.object({ 
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        actionType: z.enum(["approved", "rejected"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllAuditLogs(
          input?.startDate, 
          input?.endDate,
          input?.actionType
        );
      }),
    byRequestId: protectedProcedure
      .input(z.object({ requestId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAuditLogsByRequestId(input.requestId);
      }),
  }),

  users: router({
    updateNotificationPreferences: protectedProcedure
      .input(z.object({
        emailNotifications: z.boolean(),
        telegramNotifications: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateNotificationPreferences(
          ctx.user.id,
          input.emailNotifications,
          input.telegramNotifications
        );
        return { success: true };
      }),
    getNotificationPreferences: protectedProcedure.query(async ({ ctx }) => {
      return await db.getNotificationPreferences(ctx.user.id);
    }),
    updateRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        newRole: z.enum(["user", "operator", "manager", "admin"]),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get current user info
        const user = await db.getUserById(input.userId);
        if (!user) {
          throw new Error("User not found");
        }
        
        const oldRole = user.role;
        
        // Update user role
        await db.updateUserRole(input.userId, input.newRole);
        
        // Log role change
        await db.createRoleChange(
          input.userId,
          user.name,
          oldRole,
          input.newRole,
          ctx.user.id,
          ctx.user.name,
          input.reason
        );
        
        return { success: true };
      }),
  }),

  digestConfig: router({
    get: protectedProcedure.query(async () => {
      const config = await db.getDigestConfig();
      if (!config) return null;
      return {
        ...config,
        recipients: JSON.parse(config.recipients),
      };
    }),
    update: protectedProcedure
      .input(z.object({
        enabled: z.boolean(),
        frequency: z.enum(["daily", "weekly"]),
        recipients: z.array(z.string().email()),
      }))
      .mutation(async ({ input }) => {
        await db.updateDigestConfig(input);
        return { success: true };
      }),
    test: protectedProcedure.mutation(async () => {
      const { triggerDigestNow } = await import("./scheduler");
      await triggerDigestNow();
      return { success: true };
    }),
  }),

  roleChanges: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllRoleChanges();
    }),
    byUserId: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getRoleChangesByUserId(input.userId);
      }),
  }),

  stockTransfers: router({
    list: publicProcedure.query(async () => {
      return await db.getAllStockTransfers();
    }),
    pending: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
        throw new Error("Unauthorized: Admin or Manager role required");
      }
      return await db.getPendingStockTransfers();
    }),
    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number(),
        priority: z.enum(["low", "normal", "urgent"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createStockTransfer({
          ...input,
          requestedBy: ctx.user.id,
        });
        return { success: true };
      }),
    approve: protectedProcedure
      .input(z.object({ transferId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
          throw new Error("Unauthorized: Admin or Manager role required");
        }
        return await db.approveStockTransfer(
          input.transferId,
          ctx.user.id,
          ctx.user.name || "Unknown"
        );
      }),
    reject: protectedProcedure
      .input(z.object({
        transferId: z.number(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
          throw new Error("Unauthorized: Admin or Manager role required");
        }
        return await db.rejectStockTransfer(
          input.transferId,
          ctx.user.id,
          ctx.user.name || "Unknown",
          input.reason
        );
      }),
  }),

  notifications: notificationsRouter,

  aiAgents: aiAgentsRouter,

  inventoryAdjustments: router({
    list: protectedProcedure
      .input(z.object({
        productId: z.number().optional(),
        level: z.enum(["warehouse", "operator", "machine"]).optional(),
        adjustmentType: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getInventoryAdjustments(input);
      }),
    create: protectedProcedure
      .input(z.object({
        inventoryId: z.number(),
        productId: z.number(),
        adjustmentType: z.enum(["damage", "shrinkage", "correction", "found", "expired", "returned"]),
        quantityChange: z.number(),
        reason: z.string().min(1, "Reason is required"),
        photoUrl: z.string().optional(),
        level: z.enum(["warehouse", "operator", "machine"]),
        locationId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createInventoryAdjustment({
          ...input,
          performedBy: ctx.user.id,
          performedByName: ctx.user.name || "Unknown",
        });
      }),
  }),

  dictionaryBulkOps: router({
    bulkImport: protectedProcedure
      .input(z.object({
        dictionaryCode: z.string().min(1),
        items: z.array(z.record(z.any())),
        mode: z.enum(['create', 'update', 'upsert']),
        skipErrors: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const { processBulkImport } = await import('./batch-operations');
        return await processBulkImport(
          input.dictionaryCode,
          'bulk-import-' + Date.now(),
          input.items,
          input.mode,
          ctx.user.id,
          input.skipErrors
        );
      }),

    undoImport: protectedProcedure
      .input(z.object({ importHistoryId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const dbImportModule = await import('./db-import');
        const history = await dbImportModule.getImportHistory(input.importHistoryId);
        if (!history) {
          throw new Error('Import history not found');
        }
        const undoEntry = await dbImportModule.getLatestUndoRedoEntry(input.importHistoryId);
        if (!undoEntry) {
          throw new Error('No undo history available');
        }
        // Create new undo/redo entry
        await dbImportModule.createUndoRedoEntry({
          importHistoryId: input.importHistoryId,
          action: 'rollback',
          previousState: undoEntry.newState,
          newState: undoEntry.previousState,
          performedBy: ctx.user.id,
        });
        return { success: true, message: 'Import undone' };
      }),

    redoImport: protectedProcedure
      .input(z.object({ importHistoryId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const dbImportModule = await import('./db-import');
        const history = await dbImportModule.getImportHistory(input.importHistoryId);
        if (!history) {
          throw new Error('Import history not found');
        }
        // Create new undo/redo entry for redo
        await dbImportModule.createUndoRedoEntry({
          importHistoryId: input.importHistoryId,
          action: 'import',
          performedBy: ctx.user.id,
        });
        return { success: true, message: 'Import redone' };
      }),

    rollbackImport: protectedProcedure
      .input(z.object({ importId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { rollbackImport } = await import('./batch-operations');
        await rollbackImport(input.importId, ctx.user.id);
        return { success: true, message: 'Import rolled back successfully' };
      }),

    getImportHistory: publicProcedure
      .input(z.object({ dictionaryCode: z.string() }))
      .query(async ({ input }) => {
        const dbImportModule = await import('./db-import');
        return await dbImportModule.getImportHistoryByDictionary(input.dictionaryCode);
      }),

    deleteImportHistory: protectedProcedure
      .input(z.object({ importId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const dbImportModule = await import('./db-import');
        const history = await dbImportModule.getImportHistory(input.importId);
        if (!history) {
          throw new Error('Import history not found');
        }
        // Delete batch transactions
        await dbImportModule.deleteBatchTransactions(input.importId);
        // Delete undo/redo stack
        await dbImportModule.deleteUndoRedoStack(input.importId);
        return { success: true, message: 'Import history deleted' };
      }),

  dictionaryItems: router({
    getItems: publicProcedure
      .input(z.object({ 
        dictionaryCode: z.string(), 
        activeOnly: z.boolean().default(true),
        limit: z.number().max(100).default(50),
        cursor: z.string().optional()
      }))
      .query(async ({ input }) => {
        const dbDict = await import('./db-dictionary');
        const db = (await import('./db')).getDb();
        const { dictionaryItems } = await import('../drizzle/schema');
        const { eq, and, gt, lte } = await import('drizzle-orm');
        
        const limit = input.limit + 1; // Get one extra to determine if there are more
        let query = db.select().from(dictionaryItems)
          .where(eq(dictionaryItems.dictionaryCode, input.dictionaryCode));
        
        if (input.activeOnly) {
          query = query.where(eq(dictionaryItems.is_active, true));
        }
        
        if (input.cursor) {
          query = query.where(gt(dictionaryItems.id, parseInt(input.cursor)));
        }
        
        const items = await query
          .orderBy(dictionaryItems.sort_order, dictionaryItems.id)
          .limit(limit);
        
        const hasMore = items.length > input.limit;
        const data = hasMore ? items.slice(0, -1) : items;
        const nextCursor = hasMore ? data[data.length - 1]?.id.toString() : null;
        
        return {
          items: data,
          nextCursor,
          hasMore
        };
      }),

    getItem: publicProcedure
      .input(z.object({ dictionaryCode: z.string(), code: z.string() }))
      .query(async ({ input }) => {
        const dbDict = await import('./db-dictionary');
        return await dbDict.getDictionaryItem(input.dictionaryCode, input.code);
      }),

    search: publicProcedure
      .input(z.object({ 
        dictionaryCode: z.string(), 
        searchTerm: z.string(), 
        activeOnly: z.boolean().default(true),
        limit: z.number().max(100).default(50),
        cursor: z.string().optional()
      }))
      .query(async ({ input }) => {
        const db = (await import('./db')).getDb();
        const { dictionaryItems } = await import('../drizzle/schema');
        const { eq, and, like, gt, or } = await import('drizzle-orm');
        
        const searchPattern = `%${input.searchTerm}%`;
        const limit = input.limit + 1;
        
        let query = db.select().from(dictionaryItems)
          .where(and(
            eq(dictionaryItems.dictionaryCode, input.dictionaryCode),
            or(
              like(dictionaryItems.code, searchPattern),
              like(dictionaryItems.name, searchPattern),
              like(dictionaryItems.name_en || '', searchPattern),
              like(dictionaryItems.name_ru || '', searchPattern),
              like(dictionaryItems.name_uz || '', searchPattern)
            )
          ));
        
        if (input.activeOnly) {
          query = query.where(eq(dictionaryItems.is_active, true));
        }
        
        if (input.cursor) {
          query = query.where(gt(dictionaryItems.id, parseInt(input.cursor)));
        }
        
        const items = await query
          .orderBy(dictionaryItems.sort_order, dictionaryItems.id)
          .limit(limit);
        
        const hasMore = items.length > input.limit;
        const data = hasMore ? items.slice(0, -1) : items;
        const nextCursor = hasMore ? data[data.length - 1]?.id.toString() : null;
        
        return {
          items: data,
          nextCursor,
          hasMore
        };
      }),

    create: protectedProcedure
      .input(z.object({
        dictionaryCode: z.string().min(1),
        code: z.string().min(1).max(100),
        name: z.string().min(1).max(255),
        name_en: z.string().optional(),
        name_ru: z.string().optional(),
        name_uz: z.string().optional(),
        description: z.string().optional(),
        description_en: z.string().optional(),
        description_ru: z.string().optional(),
        description_uz: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        symbol: z.string().optional(),
        sort_order: z.number().default(0),
        is_active: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const dbDict = await import('./db-dictionary');
        const result = await dbDict.createDictionaryItem({
          ...input,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        });
        return { success: true, message: 'Dictionary item created' };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        name: z.string().optional(),
        name_en: z.string().optional(),
        name_ru: z.string().optional(),
        name_uz: z.string().optional(),
        description: z.string().optional(),
        description_en: z.string().optional(),
        description_ru: z.string().optional(),
        description_uz: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        symbol: z.string().optional(),
        sort_order: z.number().optional(),
        is_active: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const dbDict = await import('./db-dictionary');
        const { id, ...updateData } = input;
        await dbDict.updateDictionaryItem(id, {
          ...updateData,
          updatedBy: ctx.user.id,
        });
        return { success: true, message: 'Dictionary item updated' };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const dbDict = await import('./db-dictionary');
        await dbDict.deleteDictionaryItem(input.id);
        return { success: true, message: 'Dictionary item deleted' };
      }),

    toggleStatus: protectedProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        const dbDict = await import('./db-dictionary');
        await dbDict.toggleDictionaryItemStatus(input.id, input.isActive);
        return { success: true, message: 'Dictionary item status updated' };
      }),

    reorder: protectedProcedure
      .input(z.object({ items: z.array(z.object({ id: z.number(), sort_order: z.number() })) }))
      .mutation(async ({ input }) => {
        const dbDict = await import('./db-dictionary');
        await dbDict.reorderDictionaryItems(input.items);
        return { success: true, message: 'Dictionary items reordered' };
      }),

    getCount: publicProcedure
      .input(z.object({ dictionaryCode: z.string(), activeOnly: z.boolean().default(true) }))
      .query(async ({ input }) => {
        const dbDict = await import('./db-dictionary');
        return await dbDict.getDictionaryItemsCount(input.dictionaryCode, input.activeOnly);
      }),
  }),  }),
});

export type AppRouter = typeof appRouter;
