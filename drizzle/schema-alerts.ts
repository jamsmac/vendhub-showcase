import { mysqlTable, varchar, int, decimal, datetime, boolean, json, text, index, unique } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

/**
 * Alert Rules Schema
 * Stores configurable alert rules for performance metrics monitoring
 */

export const alertRules = mysqlTable(
  'alert_rules',
  {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    metric: varchar('metric', { length: 50 }).notNull(), // 'memory', 'cpu', 'disk'
    threshold: decimal('threshold', { precision: 5, scale: 2 }).notNull(), // 0-100 for percentages
    operator: varchar('operator', { length: 10 }).notNull(), // '>', '<', '>=', '<=', '=='
    escalationLevel: varchar('escalation_level', { length: 50 }).notNull(), // 'low', 'medium', 'high', 'critical'
    cooldownMinutes: int('cooldown_minutes').default(5), // Prevent alert spam
    isEnabled: boolean('is_enabled').default(true),
    notifyUser: boolean('notify_user').default(true),
    notifyAdmin: boolean('notify_admin').default(true),
    autoAction: varchar('auto_action', { length: 100 }), // Optional auto-action (e.g., 'scale_up', 'cleanup')
    createdBy: int('created_by'),
    createdAt: datetime('created_at', { mode: 'date' }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime('updated_at', { mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
  },
  (table) => ({
    metricIdx: index('metric_idx').on(table.metric),
    enabledIdx: index('enabled_idx').on(table.isEnabled),
  })
);

export const alertHistory = mysqlTable(
  'alert_history',
  {
    id: int('id').primaryKey().autoincrement(),
    ruleId: int('rule_id').notNull(),
    metric: varchar('metric', { length: 50 }).notNull(),
    value: decimal('value', { precision: 5, scale: 2 }).notNull(), // Actual metric value
    threshold: decimal('threshold', { precision: 5, scale: 2 }).notNull(),
    operator: varchar('operator', { length: 10 }).notNull(),
    status: varchar('status', { length: 20 }).default('active'), // 'active', 'acknowledged', 'resolved'
    severity: varchar('severity', { length: 20 }).notNull(), // 'low', 'medium', 'high', 'critical'
    message: text('message'),
    acknowledgedBy: int('acknowledged_by'),
    acknowledgedAt: datetime('acknowledged_at', { mode: 'date' }),
    resolvedBy: int('resolved_by'),
    resolvedAt: datetime('resolved_at', { mode: 'date' }),
    createdAt: datetime('created_at', { mode: 'date' }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    ruleIdIdx: index('rule_id_idx').on(table.ruleId),
    statusIdx: index('status_idx').on(table.status),
    severityIdx: index('severity_idx').on(table.severity),
    createdAtIdx: index('created_at_idx').on(table.createdAt),
  })
);

export const alertEscalation = mysqlTable(
  'alert_escalation',
  {
    id: int('id').primaryKey().autoincrement(),
    ruleId: int('rule_id').notNull(),
    level: int('level').notNull(), // 1, 2, 3, 4 (escalation levels)
    delayMinutes: int('delay_minutes').notNull(), // Minutes to wait before escalating
    action: varchar('action', { length: 100 }).notNull(), // 'notify_user', 'notify_admin', 'auto_cleanup', 'scale_up'
    notificationChannel: varchar('notification_channel', { length: 50 }), // 'email', 'telegram', 'in_app'
    targetUsers: json('target_users'), // JSON array of user IDs
    createdAt: datetime('created_at', { mode: 'date' }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    ruleIdIdx: index('rule_id_escalation_idx').on(table.ruleId),
    levelIdx: index('level_idx').on(table.level),
  })
);

export const alertNotifications = mysqlTable(
  'alert_notifications',
  {
    id: int('id').primaryKey().autoincrement(),
    alertId: int('alert_id').notNull(),
    userId: int('user_id').notNull(),
    channel: varchar('channel', { length: 50 }).notNull(), // 'email', 'telegram', 'in_app'
    status: varchar('status', { length: 20 }).default('pending'), // 'pending', 'sent', 'failed'
    sentAt: datetime('sent_at', { mode: 'date' }),
    failureReason: text('failure_reason'),
    createdAt: datetime('created_at', { mode: 'date' }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    alertIdIdx: index('alert_id_idx').on(table.alertId),
    userIdIdx: index('user_id_idx').on(table.userId),
    statusIdx: index('notification_status_idx').on(table.status),
  })
);

// Types
export type AlertRule = typeof alertRules.$inferSelect;
export type InsertAlertRule = typeof alertRules.$inferInsert;

export type AlertHistory = typeof alertHistory.$inferSelect;
export type InsertAlertHistory = typeof alertHistory.$inferInsert;

export type AlertEscalation = typeof alertEscalation.$inferSelect;
export type InsertAlertEscalation = typeof alertEscalation.$inferInsert;

export type AlertNotification = typeof alertNotifications.$inferSelect;
export type InsertAlertNotification = typeof alertNotifications.$inferInsert;
