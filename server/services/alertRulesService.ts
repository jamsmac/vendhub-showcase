import { db } from '../db';
import { alertRules, alertHistory, alertEscalation, alertNotifications } from '../../drizzle/schema-alerts';
import { eq, and, gte, lt, lte, gt } from 'drizzle-orm';
import { getSystemHealth } from './systemHealthService';
import { notifyOwner } from '../_core/notification';

/**
 * Alert Rules Service
 * Manages alert rule checking, triggering, and escalation
 */

interface AlertCheckResult {
  triggered: boolean;
  value: number;
  message: string;
}

interface EscalationAction {
  level: number;
  action: string;
  channel: string;
  targetUsers: number[];
}

/**
 * Check if a metric value violates an alert rule
 */
export async function checkAlertRule(
  rule: typeof alertRules.$inferSelect,
  metricValue: number
): Promise<AlertCheckResult> {
  const { threshold, operator } = rule;
  let triggered = false;

  switch (operator) {
    case '>':
      triggered = metricValue > Number(threshold);
      break;
    case '<':
      triggered = metricValue < Number(threshold);
      break;
    case '>=':
      triggered = metricValue >= Number(threshold);
      break;
    case '<=':
      triggered = metricValue <= Number(threshold);
      break;
    case '==':
      triggered = metricValue === Number(threshold);
      break;
    default:
      triggered = false;
  }

  const message = triggered
    ? `Alert: ${rule.name} - ${rule.metric} is ${metricValue.toFixed(2)}% (threshold: ${operator} ${threshold}%)`
    : `OK: ${rule.name} - ${rule.metric} is ${metricValue.toFixed(2)}%`;

  return { triggered, value: metricValue, message };
}

/**
 * Get metric value from system health
 */
export async function getMetricValue(metric: string): Promise<number> {
  const health = await getSystemHealth();

  switch (metric) {
    case 'memory':
      return health.memoryPercent;
    case 'cpu':
      return health.cpuPercent;
    case 'disk':
      return health.diskPercent;
    default:
      return 0;
  }
}

/**
 * Check if alert can be triggered (respects cooldown period)
 */
export async function canTriggerAlert(ruleId: number): Promise<boolean> {
  const rule = await db.query.alertRules.findFirst({
    where: eq(alertRules.id, ruleId),
  });

  if (!rule) return false;

  const cooldownMinutes = rule.cooldownMinutes || 5;
  const cooldownMs = cooldownMinutes * 60 * 1000;
  const now = new Date();
  const cutoffTime = new Date(now.getTime() - cooldownMs);

  // Check if there's a recent active alert for this rule
  const recentAlert = await db.query.alertHistory.findFirst({
    where: and(
      eq(alertHistory.ruleId, ruleId),
      eq(alertHistory.status, 'active'),
      gte(alertHistory.createdAt, cutoffTime)
    ),
  });

  return !recentAlert; // Can trigger if no recent active alert
}

/**
 * Trigger an alert and create history record
 */
export async function triggerAlert(
  ruleId: number,
  metric: string,
  value: number,
  threshold: number,
  operator: string
): Promise<typeof alertHistory.$inferSelect | null> {
  const rule = await db.query.alertRules.findFirst({
    where: eq(alertRules.id, ruleId),
  });

  if (!rule) return null;

  // Create alert history record
  const [result] = await db.insert(alertHistory).values({
    ruleId,
    metric,
    value: value as any,
    threshold: threshold as any,
    operator,
    status: 'active',
    severity: rule.escalationLevel,
    message: `${rule.name}: ${metric} reached ${value.toFixed(2)}% (threshold: ${operator} ${threshold}%)`,
  });

  const alertId = result.insertId;

  // Get escalation rules
  const escalations = await db.query.alertEscalation.findMany({
    where: eq(alertEscalation.ruleId, ruleId),
    orderBy: (escalations, { asc }) => asc(escalations.level),
  });

  // Trigger escalation actions
  for (const escalation of escalations) {
    await triggerEscalation(alertId, ruleId, escalation, rule);
  }

  // Send notifications
  if (rule.notifyUser || rule.notifyAdmin) {
    await sendAlertNotifications(alertId, ruleId, rule);
  }

  return await db.query.alertHistory.findFirst({
    where: eq(alertHistory.id, alertId),
  });
}

/**
 * Trigger escalation action
 */
export async function triggerEscalation(
  alertId: number,
  ruleId: number,
  escalation: typeof alertEscalation.$inferSelect,
  rule: typeof alertRules.$inferSelect
): Promise<void> {
  switch (escalation.action) {
    case 'notify_user':
      // Notification already handled in sendAlertNotifications
      break;

    case 'notify_admin':
      // Send admin notification
      await notifyOwner({
        title: `🚨 Alert: ${rule.name}`,
        content: `Performance alert triggered: ${rule.metric} exceeded threshold. Alert ID: ${alertId}`,
      });
      break;

    case 'auto_cleanup':
      // Trigger automatic cleanup
      console.log(`[Alert] Triggering auto cleanup for alert ${alertId}`);
      // Implementation: Call cleanup service
      break;

    case 'scale_up':
      // Trigger scaling action
      console.log(`[Alert] Triggering scale up for alert ${alertId}`);
      // Implementation: Call scaling service
      break;
  }
}

/**
 * Send alert notifications to users
 */
export async function sendAlertNotifications(
  alertId: number,
  ruleId: number,
  rule: typeof alertRules.$inferSelect
): Promise<void> {
  // Get escalation targets
  const escalations = await db.query.alertEscalation.findMany({
    where: eq(alertEscalation.ruleId, ruleId),
  });

  const targetUsers = new Set<number>();
  const channels = new Set<string>();

  for (const escalation of escalations) {
    if (escalation.targetUsers) {
      const users = Array.isArray(escalation.targetUsers)
        ? escalation.targetUsers
        : JSON.parse(escalation.targetUsers as string);
      users.forEach((userId: number) => targetUsers.add(userId));
    }
    if (escalation.notificationChannel) {
      channels.add(escalation.notificationChannel);
    }
  }

  // Create notification records
  for (const userId of targetUsers) {
    for (const channel of channels) {
      await db.insert(alertNotifications).values({
        alertId,
        userId,
        channel,
        status: 'pending',
      });
    }
  }
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(
  alertId: number,
  userId: number
): Promise<void> {
  await db
    .update(alertHistory)
    .set({
      status: 'acknowledged',
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    })
    .where(eq(alertHistory.id, alertId));
}

/**
 * Resolve an alert
 */
export async function resolveAlert(
  alertId: number,
  userId: number
): Promise<void> {
  await db
    .update(alertHistory)
    .set({
      status: 'resolved',
      resolvedBy: userId,
      resolvedAt: new Date(),
    })
    .where(eq(alertHistory.id, alertId));
}

/**
 * Check all enabled alert rules against current metrics
 */
export async function checkAllAlerts(): Promise<void> {
  const enabledRules = await db.query.alertRules.findMany({
    where: eq(alertRules.isEnabled, true),
  });

  for (const rule of enabledRules) {
    try {
      const metricValue = await getMetricValue(rule.metric);
      const checkResult = await checkAlertRule(rule, metricValue);

      if (checkResult.triggered) {
        const canTrigger = await canTriggerAlert(rule.id);
        if (canTrigger) {
          await triggerAlert(
            rule.id,
            rule.metric,
            metricValue,
            Number(rule.threshold),
            rule.operator
          );
          console.log(`[Alert] Triggered: ${checkResult.message}`);
        }
      }
    } catch (error) {
      console.error(`[Alert] Error checking rule ${rule.id}:`, error);
    }
  }
}

/**
 * Get alert history with filtering
 */
export async function getAlertHistory(
  filters?: {
    ruleId?: number;
    status?: string;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
): Promise<(typeof alertHistory.$inferSelect)[]> {
  let query = db.query.alertHistory.findMany();

  if (filters?.ruleId) {
    query = query.where(eq(alertHistory.ruleId, filters.ruleId));
  }

  if (filters?.status) {
    query = query.where(eq(alertHistory.status, filters.status));
  }

  if (filters?.severity) {
    query = query.where(eq(alertHistory.severity, filters.severity));
  }

  if (filters?.startDate && filters?.endDate) {
    query = query.where(
      and(
        gte(alertHistory.createdAt, filters.startDate),
        lte(alertHistory.createdAt, filters.endDate)
      )
    );
  }

  const limit = filters?.limit || 100;
  return query.limit(limit).orderBy((alerts) => alerts.createdAt);
}

/**
 * Get active alerts
 */
export async function getActiveAlerts(): Promise<(typeof alertHistory.$inferSelect)[]> {
  return await db.query.alertHistory.findMany({
    where: eq(alertHistory.status, 'active'),
    orderBy: (alerts) => alerts.createdAt,
  });
}

/**
 * Get alert rule by ID
 */
export async function getAlertRuleById(
  ruleId: number
): Promise<(typeof alertRules.$inferSelect) | null> {
  return await db.query.alertRules.findFirst({
    where: eq(alertRules.id, ruleId),
  });
}

/**
 * Create alert rule
 */
export async function createAlertRule(
  data: Omit<typeof alertRules.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
): Promise<typeof alertRules.$inferSelect> {
  const [result] = await db.insert(alertRules).values(data);
  const ruleId = result.insertId;
  return (await getAlertRuleById(ruleId))!;
}

/**
 * Update alert rule
 */
export async function updateAlertRule(
  ruleId: number,
  data: Partial<typeof alertRules.$inferInsert>
): Promise<void> {
  await db.update(alertRules).set(data).where(eq(alertRules.id, ruleId));
}

/**
 * Delete alert rule
 */
export async function deleteAlertRule(ruleId: number): Promise<void> {
  // Delete related escalation rules
  await db.delete(alertEscalation).where(eq(alertEscalation.ruleId, ruleId));

  // Delete the rule
  await db.delete(alertRules).where(eq(alertRules.id, ruleId));
}

/**
 * Get all alert rules
 */
export async function getAllAlertRules(): Promise<(typeof alertRules.$inferSelect)[]> {
  return await db.query.alertRules.findMany({
    orderBy: (rules) => rules.createdAt,
  });
}
