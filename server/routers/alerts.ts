import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  checkAllAlerts,
  createAlertRule,
  deleteAlertRule,
  getAllAlertRules,
  getAlertHistory,
  getAlertRuleById,
  getActiveAlerts,
  acknowledgeAlert,
  resolveAlert,
  updateAlertRule,
  triggerAlert,
} from '../services/alertRulesService';
import {
  getRecommendations,
  getRecommendationsByType,
  getCriticalRecommendations,
  getRecommendationStats,
  formatRecommendation,
} from '../services/performanceRecommendationsService';

/**
 * Alert Rules Router
 * Manages alert rules, history, and notifications
 */

const AlertRuleInput = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  metric: z.enum(['memory', 'cpu', 'disk']),
  threshold: z.number().min(0).max(100),
  operator: z.enum(['>', '<', '>=', '<=', '==']),
  escalationLevel: z.enum(['low', 'medium', 'high', 'critical']),
  cooldownMinutes: z.number().int().min(1).default(5),
  isEnabled: z.boolean().default(true),
  notifyUser: z.boolean().default(true),
  notifyAdmin: z.boolean().default(true),
  autoAction: z.string().optional(),
});

const AlertHistoryFilter = z.object({
  ruleId: z.number().optional(),
  status: z.enum(['active', 'acknowledged', 'resolved']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  limit: z.number().int().min(1).max(1000).default(100),
});

export const alertsRouter = router({
  /**
   * Create new alert rule
   */
  createRule: protectedProcedure
    .input(AlertRuleInput)
    .mutation(async ({ input, ctx }) => {
      try {
        const rule = await createAlertRule({
          ...input,
          createdBy: ctx.user.id,
        });

        return {
          success: true,
          message: `Alert rule "${rule.name}" created successfully`,
          rule,
        };
      } catch (error) {
        console.error('[Alerts] Error creating rule:', error);
        throw new Error('Failed to create alert rule');
      }
    }),

  /**
   * Update alert rule
   */
  updateRule: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: AlertRuleInput.partial(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const rule = await getAlertRuleById(input.id);
        if (!rule) {
          throw new Error('Alert rule not found');
        }

        await updateAlertRule(input.id, input.data);

        const updated = await getAlertRuleById(input.id);
        return {
          success: true,
          message: `Alert rule updated successfully`,
          rule: updated,
        };
      } catch (error) {
        console.error('[Alerts] Error updating rule:', error);
        throw new Error('Failed to update alert rule');
      }
    }),

  /**
   * Delete alert rule
   */
  deleteRule: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const rule = await getAlertRuleById(input.id);
        if (!rule) {
          throw new Error('Alert rule not found');
        }

        await deleteAlertRule(input.id);

        return {
          success: true,
          message: `Alert rule "${rule.name}" deleted successfully`,
        };
      } catch (error) {
        console.error('[Alerts] Error deleting rule:', error);
        throw new Error('Failed to delete alert rule');
      }
    }),

  /**
   * List all alert rules
   */
  listRules: publicProcedure.query(async () => {
    try {
      const rules = await getAllAlertRules();
      return {
        success: true,
        rules,
        count: rules.length,
      };
    } catch (error) {
      console.error('[Alerts] Error listing rules:', error);
      throw new Error('Failed to list alert rules');
    }
  }),

  /**
   * Get single alert rule
   */
  getRule: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const rule = await getAlertRuleById(input.id);
        if (!rule) {
          throw new Error('Alert rule not found');
        }

        return {
          success: true,
          rule,
        };
      } catch (error) {
        console.error('[Alerts] Error getting rule:', error);
        throw new Error('Failed to get alert rule');
      }
    }),

  /**
   * Get alert history with filtering
   */
  getHistory: publicProcedure
    .input(AlertHistoryFilter)
    .query(async ({ input }) => {
      try {
        const alerts = await getAlertHistory({
          ruleId: input.ruleId,
          status: input.status,
          severity: input.severity,
          startDate: input.startDate,
          endDate: input.endDate,
          limit: input.limit,
        });

        return {
          success: true,
          alerts,
          count: alerts.length,
        };
      } catch (error) {
        console.error('[Alerts] Error getting history:', error);
        throw new Error('Failed to get alert history');
      }
    }),

  /**
   * Get active alerts
   */
  getActive: publicProcedure.query(async () => {
    try {
      const alerts = await getActiveAlerts();
      return {
        success: true,
        alerts,
        count: alerts.length,
      };
    } catch (error) {
      console.error('[Alerts] Error getting active alerts:', error);
      throw new Error('Failed to get active alerts');
    }
  }),

  /**
   * Acknowledge alert
   */
  acknowledgeAlert: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await acknowledgeAlert(input.alertId, ctx.user.id);

        return {
          success: true,
          message: 'Alert acknowledged',
        };
      } catch (error) {
        console.error('[Alerts] Error acknowledging alert:', error);
        throw new Error('Failed to acknowledge alert');
      }
    }),

  /**
   * Resolve alert
   */
  resolveAlert: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await resolveAlert(input.alertId, ctx.user.id);

        return {
          success: true,
          message: 'Alert resolved',
        };
      } catch (error) {
        console.error('[Alerts] Error resolving alert:', error);
        throw new Error('Failed to resolve alert');
      }
    }),

  /**
   * Test alert rule
   */
  testRule: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const rule = await getAlertRuleById(input.id);
        if (!rule) {
          throw new Error('Alert rule not found');
        }

        // Trigger test alert with current metric value
        const testValue = Math.random() * 100; // Simulate metric value
        const alert = await triggerAlert(
          rule.id,
          rule.metric,
          testValue,
          Number(rule.threshold),
          rule.operator
        );

        return {
          success: true,
          message: `Test alert triggered for rule "${rule.name}"`,
          alert,
        };
      } catch (error) {
        console.error('[Alerts] Error testing rule:', error);
        throw new Error('Failed to test alert rule');
      }
    }),

  /**
   * Check all alerts (admin only)
   */
  checkAll: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // Verify admin
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      await checkAllAlerts();

      return {
        success: true,
        message: 'All alerts checked',
      };
    } catch (error) {
      console.error('[Alerts] Error checking all alerts:', error);
      throw new Error('Failed to check all alerts');
    }
  }),
});

/**
 * Recommendations Router
 * Manages performance recommendations
 */

export const recommendationsRouter = router({
  /**
   * Get all recommendations
   */
  getAll: publicProcedure.query(async () => {
    try {
      const recommendations = await getRecommendations();
      const stats = await getRecommendationStats();

      return {
        success: true,
        recommendations: recommendations.map((rec) => ({
          ...rec,
          ...formatRecommendation(rec),
        })),
        stats,
      };
    } catch (error) {
      console.error('[Recommendations] Error getting recommendations:', error);
      throw new Error('Failed to get recommendations');
    }
  }),

  /**
   * Get recommendations by type
   */
  getByType: publicProcedure
    .input(
      z.object({
        type: z.enum(['peak_usage', 'trend', 'cost_optimization', 'capacity_planning', 'performance_improvement']),
      })
    )
    .query(async ({ input }) => {
      try {
        const recommendations = await getRecommendationsByType(input.type);

        return {
          success: true,
          recommendations: recommendations.map((rec) => ({
            ...rec,
            ...formatRecommendation(rec),
          })),
          count: recommendations.length,
        };
      } catch (error) {
        console.error('[Recommendations] Error getting recommendations by type:', error);
        throw new Error('Failed to get recommendations');
      }
    }),

  /**
   * Get critical recommendations
   */
  getCritical: publicProcedure.query(async () => {
    try {
      const recommendations = await getCriticalRecommendations();

      return {
        success: true,
        recommendations: recommendations.map((rec) => ({
          ...rec,
          ...formatRecommendation(rec),
        })),
        count: recommendations.length,
      };
    } catch (error) {
      console.error('[Recommendations] Error getting critical recommendations:', error);
      throw new Error('Failed to get critical recommendations');
    }
  }),

  /**
   * Get recommendation statistics
   */
  getStats: publicProcedure.query(async () => {
    try {
      const stats = await getRecommendationStats();

      return {
        success: true,
        stats,
      };
    } catch (error) {
      console.error('[Recommendations] Error getting stats:', error);
      throw new Error('Failed to get recommendation stats');
    }
  }),

  /**
   * Refresh recommendations (admin only)
   */
  refresh: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // Verify admin
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const recommendations = await getRecommendations(true); // Force refresh
      const stats = await getRecommendationStats();

      return {
        success: true,
        message: 'Recommendations refreshed',
        recommendations: recommendations.map((rec) => ({
          ...rec,
          ...formatRecommendation(rec),
        })),
        stats,
      };
    } catch (error) {
      console.error('[Recommendations] Error refreshing:', error);
      throw new Error('Failed to refresh recommendations');
    }
  }),
});
