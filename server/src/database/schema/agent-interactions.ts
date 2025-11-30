/**
 * Agent Interactions Schema
 * 
 * Complete audit trail of all agent interactions and user feedback.
 * Records every action taken by agents and user feedback for learning and debugging.
 * 
 * @module database/schema/agent-interactions
 */

import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  integer,
  text,
  float,
  index,
  pgEnum,
  foreignKey,
  check,
} from 'drizzle-orm/pg-core';

import { relations, sql } from 'drizzle-orm';
import { agentLearningContexts } from './agent-learning-contexts';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Interaction type enum - defines the type of interaction
 * @enum {string}
 */
export const interactionTypeEnum = pgEnum('interaction_type_enum', [
  'suggestion_generated',
  'file_uploaded',
  'file_analyzed',
  'data_imported',
  'feedback_recorded',
  'learning_updated',
]);

// ============================================================================
// TABLE DEFINITION
// ============================================================================

/**
 * Agent Interactions Table
 * 
 * Stores complete audit trail of all agent interactions.
 * 
 * Example interaction:
 * ```json
 * {
 *   "action": "suggestion_generated",
 *   "input": {
 *     "field": "machine_model",
 *     "context": {...}
 *   },
 *   "output": {
 *     "suggestion": "VendMaster 3000",
 *     "confidence": 0.95
 *   },
 *   "userAction": "approved"
 * }
 * ```
 */
export const agentInteractions = pgTable(
  'agent_interactions',
  {
    // Primary Key
    id: uuid('id').primaryKey().defaultRandom(),

    // Relationship to Agent
    agentId: uuid('agent_id')
      .notNull()
      .references(() => agentLearningContexts.id, { onDelete: 'cascade' }),

    // Interaction Details
    interactionType: interactionTypeEnum('interaction_type').notNull(),
    inputData: jsonb('input_data'),
    outputData: jsonb('output_data'),

    // User Action and Feedback
    userAction: varchar('user_action', { length: 20 }),
    userNotes: text('user_notes'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    // User Information
    userId: uuid('user_id'),

    // Metadata
    metadata: jsonb('metadata').default('{}'),

    // Performance Metrics
    processingTimeMs: integer('processing_time_ms'),
    confidenceScore: float('confidence_score'),
  },
  (table) => ({
    // Foreign key constraint
    fkAgentId: foreignKey({
      columns: [table.agentId],
      foreignColumns: [agentLearningContexts.id],
      name: 'agent_interactions_agent_id_fk',
    }),

    // Confidence score check constraint
    confidenceCheck: check(
      'confidence_check',
      sql`${table.confidenceScore} >= 0 AND ${table.confidenceScore} <= 1`
    ),

    // Indexes for common queries
    idxAgentId: index('idx_agent_interactions_agent_id').on(table.agentId),
    idxType: index('idx_agent_interactions_type').on(table.interactionType),
    idxUserAction: index('idx_agent_interactions_user_action').on(
      table.userAction
    ),
    idxCreatedAt: index('idx_agent_interactions_created_at').on(
      table.createdAt
    ),
    idxUserId: index('idx_agent_interactions_user_id').on(table.userId),

    // JSONB indexes for data queries
    idxInputData: index('idx_agent_interactions_input_data').on(
      table.inputData
    ),
    idxOutputData: index('idx_agent_interactions_output_data').on(
      table.outputData
    ),

    // Composite index for common queries
    idxAgentTypeDate: index('idx_agent_interactions_agent_type_date').on(
      table.agentId,
      table.createdAt
    ),
  })
);

// ============================================================================
// RELATIONSHIPS
// ============================================================================

/**
 * Relations for agent interactions
 */
export const agentInteractionsRelations = relations(
  agentInteractions,
  ({ one }) => ({
    agent: one(agentLearningContexts, {
      fields: [agentInteractions.agentId],
      references: [agentLearningContexts.id],
    }),
  })
);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Type for agent interaction row
 */
export type AgentInteraction = typeof agentInteractions.$inferSelect;

/**
 * Type for inserting a new agent interaction
 */
export type NewAgentInteraction = typeof agentInteractions.$inferInsert;

/**
 * Interaction type literal
 */
export type InteractionType =
  | 'suggestion_generated'
  | 'file_uploaded'
  | 'file_analyzed'
  | 'data_imported'
  | 'feedback_recorded'
  | 'learning_updated';

/**
 * User action type
 */
export type UserAction = 'accepted' | 'rejected' | 'modified' | 'ignored';

/**
 * Input data structure
 */
export interface InteractionInputData {
  [key: string]: unknown;
  field?: string;
  context?: Record<string, unknown>;
  fileId?: string;
  recordId?: string;
}

/**
 * Output data structure
 */
export interface InteractionOutputData {
  [key: string]: unknown;
  suggestion?: string | number | boolean;
  confidence?: number;
  alternatives?: (string | number)[];
  success?: boolean;
  message?: string;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Interaction with agent information
 */
export type InteractionWithAgent = AgentInteraction & {
  agent: typeof agentLearningContexts.$inferSelect;
};

/**
 * Interaction statistics
 */
export interface InteractionStats {
  totalInteractions: number;
  averageProcessingTime: number;
  averageConfidence: number;
  userActionDistribution: Record<UserAction, number>;
  interactionTypeDistribution: Record<InteractionType, number>;
}

/**
 * Interaction timeline entry
 */
export interface InteractionTimelineEntry extends AgentInteraction {
  agentType?: string;
  sectionName?: string;
  userName?: string;
}

/**
 * Interaction query result
 */
export interface InteractionQueryResult {
  id: string;
  agentId: string;
  interactionType: InteractionType;
  userAction: UserAction | null;
  createdAt: Date;
  processingTimeMs: number | null;
  confidenceScore: number | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Valid user actions
 */
export const VALID_USER_ACTIONS: UserAction[] = [
  'accepted',
  'rejected',
  'modified',
  'ignored',
];

/**
 * Valid interaction types
 */
export const VALID_INTERACTION_TYPES: InteractionType[] = [
  'suggestion_generated',
  'file_uploaded',
  'file_analyzed',
  'data_imported',
  'feedback_recorded',
  'learning_updated',
];

// ============================================================================
// EXPORTS
// ============================================================================

export default agentInteractions;
