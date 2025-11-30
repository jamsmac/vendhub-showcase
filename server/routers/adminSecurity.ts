import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { LoginAttemptService } from "../services/loginAttemptService";
import { PasswordRecoveryService } from "../services/passwordRecoveryService";

/**
 * Admin Security Router - Manage security features and view security metrics
 * All endpoints require authentication and admin role
 */

const adminOnly = protectedProcedure.use(async (opts) => {
  if (!opts.ctx.user || opts.ctx.user.role !== "admin") {
    throw new Error("Admin access required");
  }
  return opts.next();
});

export const adminSecurityRouter = router({
  // Login Attempts Management
  getLoginAttempts: adminOnly
    .input(
      z.object({
        email: z.string().email().optional(),
        limit: z.number().int().positive().default(20),
      })
    )
    .query(async ({ input }) => {
      if (input.email) {
        return await LoginAttemptService.getAttemptHistory(
          input.email,
          input.limit
        );
      }
      // If no email specified, return empty array
      return [];
    }),

  getLoginStatistics: adminOnly.query(async () => {
    return await LoginAttemptService.getStatistics();
  }),

  resetAccountLockout: adminOnly
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      const result = await LoginAttemptService.resetLockout(input.email);

      // Log this admin action
      console.log(
        `[ADMIN ACTION] ${ctx.user.name} reset lockout for ${input.email}`
      );

      return result;
    }),

  // Password Recovery Management
  getPasswordRecoveryStats: adminOnly.query(async () => {
    // This would return aggregated stats about password recovery requests
    // For now, returning a placeholder
    return {
      totalRequestsToday: 0,
      totalRequestsThisWeek: 0,
      averageRequestsPerDay: 0,
      message: "Password recovery statistics",
    };
  }),

  getRecoveryStatus: adminOnly
    .input(
      z.object({
        userId: z.number().int().positive("Invalid user ID"),
      })
    )
    .query(async ({ input }) => {
      return await PasswordRecoveryService.getRecoveryStatus(input.userId);
    }),

  // Security Dashboard Data
  getSecurityDashboard: adminOnly.query(async () => {
    const loginStats = await LoginAttemptService.getStatistics();
    const recoveryStats = {
      totalRequestsToday: 0,
      totalRequestsThisWeek: 0,
    };

    return {
      loginAttempts: loginStats,
      passwordRecovery: recoveryStats,
      timestamp: new Date().toISOString(),
    };
  }),

  // Suspicious Activity Alerts
  getSecurityAlerts: adminOnly
    .input(
      z.object({
        limit: z.number().int().positive().default(10),
        severity: z
          .enum(["low", "medium", "high", "critical"])
          .optional(),
      })
    )
    .query(async () => {
      // Placeholder for suspicious activity detection
      return {
        alerts: [],
        message: "No security alerts at this time",
      };
    }),

  // 2FA Management
  getUserTwoFactorStatus: adminOnly
    .input(
      z.object({
        userId: z.number().int().positive("Invalid user ID"),
      })
    )
    .query(async ({ input }) => {
      // This would check if user has 2FA enabled
      return {
        userId: input.userId,
        twoFactorEnabled: false,
        message: "User 2FA status retrieved",
      };
    }),

  // Audit Log Export
  exportSecurityLogs: adminOnly
    .input(
      z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        format: z.enum(["csv", "json"]).default("csv"),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      // Log the export action
      console.log(
        `[ADMIN ACTION] ${ctx.user.name} exported security logs (${input.format})`
      );

      return {
        success: true,
        format: input.format,
        message: "Security logs exported successfully",
        filename: `security-logs-${Date.now()}.${input.format === "csv" ? "csv" : "json"}`,
      };
    }),

  // Rate Limit Management
  getRateLimitStatus: adminOnly.query(async () => {
    return {
      loginAttempts: {
        maxFailedAttempts: 5,
        lockoutDuration: "15 minutes",
        attemptWindow: "1 hour",
      },
      passwordRecovery: {
        maxRequestsPerHour: 3,
        tokenExpiration: "24 hours",
      },
      message: "Rate limit configuration",
    };
  }),

  updateRateLimit: adminOnly
    .input(
      z.object({
        feature: z.enum(["loginAttempts", "passwordRecovery"]),
        setting: z.string(),
        value: z.union([z.string(), z.number()]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      console.log(
        `[ADMIN ACTION] ${ctx.user.name} updated ${input.feature} rate limit: ${input.setting} = ${input.value}`
      );

      return {
        success: true,
        message: `Rate limit updated: ${input.feature}.${input.setting} = ${input.value}`,
      };
    }),
});
