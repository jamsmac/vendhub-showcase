import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { telegramRouter } from "./telegram-router";

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
  }),

  tasks: router({
    list: publicProcedure.query(async () => {
      return await db.getAllTasks();
    }),
    byStatus: publicProcedure
      .input(z.object({ status: z.enum(["pending", "in_progress", "completed", "rejected"]) }))
      .query(async ({ input }) => {
        return await db.getTasksByStatus(input.status);
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
  }),

  telegram: telegramRouter,

  accessRequests: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllAccessRequests();
    }),
    pending: protectedProcedure.query(async () => {
      return await db.getPendingAccessRequests();
    }),
    approve: protectedProcedure
      .input(z.object({ id: z.number(), approvedBy: z.number() }))
      .mutation(async ({ input }) => {
        await db.approveAccessRequest(input.id, input.approvedBy);
        
        // Get request details to send notification
        const requests = await db.getAllAccessRequests();
        const request = requests.find(r => r.id === input.id);
        
        if (request && request.chatId) {
          const { sendMessage } = await import('./telegram');
          await sendMessage(parseInt(request.chatId), `✅ **Ваша заявка одобрена!**

Поздравляем! Вам предоставлен доступ к VendHub Manager.

🔗 **Войти в систему:**
${process.env.PUBLIC_URL || 'https://vendhub-showcase.manus.space'}

Используйте свой Telegram аккаунт для входа.`);
        }
        
        return { success: true };
      }),
    reject: protectedProcedure
      .input(z.object({ id: z.number(), approvedBy: z.number() }))
      .mutation(async ({ input }) => {
        await db.rejectAccessRequest(input.id, input.approvedBy);
        
        // Get request details to send notification
        const requests = await db.getAllAccessRequests();
        const request = requests.find(r => r.id === input.id);
        
        if (request && request.chatId) {
          const { sendMessage } = await import('./telegram');
          await sendMessage(parseInt(request.chatId), `❌ **Ваша заявка отклонена**

К сожалению, ваша заявка на доступ к VendHub Manager была отклонена.

Для уточнения причин обратитесь к администратору.`);
        }
        
        return { success: true };
      }),
  }),

  stockTransfers: router({
    list: publicProcedure.query(async () => {
      return await db.getAllStockTransfers();
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
  }),
});

export type AppRouter = typeof appRouter;
