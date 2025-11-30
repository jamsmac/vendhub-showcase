/**
 * Agent Approved Records Schema
 * 
 * Stores approved agent suggestions as actual database records.
 * Provides traceability back to original suggestion and allows records to be edited.
 * 
 * @module database/schema/agent-approved-records
 */

import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  boolean,
  index,
  pgEnum,
  foreignKey,
} from 'drizzle-orm/pg-core';

import { relations } from 'drizzle-orm';
import { agentLearningContexts } from './agent-learning-contexts';
import { agentSuggestions } from './agent-suggestions';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Record type enum - defines the type of record
 * @enum {string}
 */
export const recordTypeEnum = pgEnum('record_type_enum', [
  'machine',
  'task',
  'product',
  'operator',
  'custom',
]);

// ============================================================================
// TABLE DEFINITION
// ============================================================================

/**
 * Agent Approved Records Table
 * 
 * Stores approved agent suggestions as actual database records.
 * 
 * Example record_data:
 * ```json
 * {
 *   "id": "M001",
 *   "model": "VendMaster 3000",
 *   "location": "Main Street",
 *   "status": "Online",
 *   "lastMaintenance": "2025-11-30",
 *   "capacity": 500
 * }
 * ```
 */
export const agentApprovedRecords = pgTable(
  'agent_approved_records',
  {
    // Primary Key
    id: uuid('id').primaryKey().defaultRandom(),

    // Relationships
    agentId: uuid('agent_id')
      .references(() => agentLearningContexts.id, { onDelete: 'setNull' }),
    originalSuggestionId: uuid('original_suggestion_id')
      .references(() => agentSuggestions.id, { onDelete: 'setNull' }),

    // Record Information
    recordType: recordTypeEnum('record_type').notNull(),
    recordData: jsonb('record_data').notNull(),

    // Reference to Main Database Record
    recordId: uuid('record_id'),
    recordTable: varchar('record_table', { length: 100 }),

    // Status
    status: varchar('status', { length: 20 }).notNull().default('created'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdByAgent: boolean('created_by_agent').default(true),

    // User Information
    createdBy: uuid('created_by'),
    approvedBy: uuid('approved_by'),

    // Metadata
    metadata: jsonb('metadata').default('{}'),
  },
  (table) => ({
    // Foreign key constraints
    fkAgentId: foreignKey({
      columns: [table.agentId],
      foreignColumns: [agentLearningContexts.id],
      name: 'agent_approved_records_agent_id_fk',
    }),
    fkSuggestionId: foreignKey({
      columns: [table.originalSuggestionId],
      foreignColumns: [agentSuggestions.id],
      name: 'agent_approved_records_suggestion_id_fk',
    }),

    // Indexes for common queries
    idxAgentId: index('idx_agent_approved_records_agent_id').on(table.agentId),
    idxSuggestionId: index('idx_agent_approved_records_suggestion_id').on(
      table.originalSuggestionId
    ),
    idxRecordType: index('idx_agent_approved_records_record_type').on(
      table.recordType
    ),
    idxRecordId: index('idx_agent_approved_records_record_id').on(
      table.recordId
    ),
    idxCreatedAt: index('idx_agent_approved_records_created_at').on(
      table.createdAt
    ),
    idxStatus: index('idx_agent_approved_records_status').on(table.status),

    // JSONB index for record data queries
    idxRecordData: index('idx_agent_approved_records_data').on(
      table.recordData
    ),

    // Composite index for common queries
    idxAgentTypeDate: index('idx_agent_approved_records_agent_type_date').on(
      table.agentId,
      table.createdAt
    ),
  })
);

// ============================================================================
// RELATIONSHIPS
// ============================================================================

/**
 * Relations for agent approved records
 */
export const agentApprovedRecordsRelations = relations(
  agentApprovedRecords,
  ({ one }) => ({
    agent: one(agentLearningContexts, {
      fields: [agentApprovedRecords.agentId],
      references: [agentLearningContexts.id],
    }),
    suggestion: one(agentSuggestions, {
      fields: [agentApprovedRecords.originalSuggestionId],
      references: [agentSuggestions.id],
    }),
  })
);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Type for agent approved record row
 */
export type AgentApprovedRecord = typeof agentApprovedRecords.$inferSelect;

/**
 * Type for inserting a new agent approved record
 */
export type NewAgentApprovedRecord = typeof agentApprovedRecords.$inferInsert;

/**
 * Record type literal
 */
export type RecordType = 'machine' | 'task' | 'product' | 'operator' | 'custom';

/**
 * Record status type
 */
export type RecordStatus = 'created' | 'modified' | 'archived';

/**
 * Record data structure (flexible JSONB)
 */
export interface RecordData {
  [key: string]: unknown;
  id?: string | number;
  name?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Approved record with agent information
 */
export type ApprovedRecordWithAgent = AgentApprovedRecord & {
  agent: typeof agentLearningContexts.$inferSelect | null;
};

/**
 * Approved record with suggestion information
 */
export type ApprovedRecordWithSuggestion = AgentApprovedRecord & {
  suggestion: typeof agentSuggestions.$inferSelect | null;
};

/**
 * Approved record with full relationships
 */
export type ApprovedRecordWithRelations = AgentApprovedRecord & {
  agent: typeof agentLearningContexts.$inferSelect | null;
  suggestion: typeof agentSuggestions.$inferSelect | null;
};

/**
 * Approved record statistics
 */
export interface ApprovedRecordStats {
  totalRecords: number;
  recordsByType: Record<RecordType, number>;
  recordsByStatus: Record<RecordStatus, number>;
  createdByAgent: number;
  createdManually: number;
  averageRecordSize: number;
}

/**
 * Record creation result
 */
export interface RecordCreationResult {
  success: boolean;
  recordId: string;
  message: string;
  recordData?: RecordData;
  errors?: string[];
}

/**
 * Bulk record creation result
 */
export interface BulkRecordCreationResult {
  totalRequested: number;
  successCount: number;
  failureCount: number;
  createdRecords: string[];
  failedRecords: Array<{
    index: number;
    error: string;
  }>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Valid record types
 */
export const VALID_RECORD_TYPES: RecordType[] = [
  'machine',
  'task',
  'product',
  'operator',
  'custom',
];

/**
 * Valid record statuses
 */
export const VALID_RECORD_STATUSES: RecordStatus[] = [
  'created',
  'modified',
  'archived',
];

/**
 * Record type descriptions
 */
export const RECORD_TYPE_DESCRIPTIONS: Record<RecordType, string> = {
  machine: 'Vending machine',
  task: 'Maintenance or operation task',
  product: 'Product/item in inventory',
  operator: 'Operator or staff member',
  custom: 'Custom record type',
};

// ============================================================================
// EXPORTS
// ============================================================================

export default agentApprovedRecords;
