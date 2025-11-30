/**
 * Agent Suggestions Schema
 * 
 * Stores AI-generated suggestions for user approval.
 * Each suggestion includes confidence score and user feedback tracking.
 * 
 * @module database/schema/agent-suggestions
 */

import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  float,
  text,
  boolean,
  index,
  pgEnum,
  foreignKey,
  check,
} from 'drizzle-orm/pg-core';

import { relations, sql } from 'drizzle-orm';
import { agentLearningContexts } from './agent-learning-contexts';
import { agentApprovedRecords } from './agent-approved-records';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Suggestion type enum - defines the type of suggestion
 * @enum {string}
 */
export const suggestionTypeEnum = pgEnum('suggestion_type_enum', [
  'autocomplete',
  'data_import',
  'field_value',
  'duplicate_detection',
  'pattern_recognition',
  'relationship_suggestion',
]);

/**
 * User feedback enum - tracks user response to suggestions
 * @enum {string}
 */
export const userFeedbackEnum = pgEnum('user_feedback_enum', [
  'approved',
  'rejected',
  'modified',
]);

// ============================================================================
// TABLE DEFINITION
// ============================================================================

/**
 * Agent Suggestions Table
 * 
 * Stores AI-generated suggestions that are presented to users for approval.
 * Tracks user feedback for continuous learning.
 * 
 * Example content:
 * ```json
 * {
 *   "value": "VendMaster 3000",
 *   "field": "machine_model",
 *   "reasoning": "Most common model in uploaded data (65%)",
 *   "examples": ["M001", "M002", "M003"],
 *   "alternatives": ["CoolBox Pro", "VendMax"]
 * }
 * ```
 */
export const agentSuggestions = pgTable(
  'agent_suggestions',
  {
    // Primary Key
    id: uuid('id').primaryKey().defaultRandom(),

    // Relationship to Learning Context
    agentId: uuid('agent_id')
      .notNull()
      .references(() => agentLearningContexts.id, { onDelete: 'cascade' }),

    // Suggestion Details
    suggestionType: suggestionTypeEnum('suggestion_type').notNull(),
    content: jsonb('content').notNull(),

    // Confidence and Source
    confidence: float('confidence').notNull(),
    source: varchar('source', { length: 50 }).notNull().default('pattern'),
    reasoning: text('reasoning'),

    // User Feedback
    userFeedback: userFeedbackEnum('user_feedback'),
    feedbackNotes: text('feedback_notes'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    approvedAt: timestamp('approved_at', { withTimezone: true }),

    // User Information
    createdByAgent: boolean('created_by_agent').default(true),
    approvedBy: uuid('approved_by'),

    // Metadata
    metadata: jsonb('metadata').default('{}'),
  },
  (table) => ({
    // Foreign key constraint
    fkAgentId: foreignKey({
      columns: [table.agentId],
      foreignColumns: [agentLearningContexts.id],
      name: 'agent_suggestions_agent_id_fk',
    }),

    // Confidence check constraint
    confidenceCheck: check(
      'confidence_check',
      sql`${table.confidence} >= 0 AND ${table.confidence} <= 1`
    ),

    // Indexes for common queries
    idxAgentId: index('idx_agent_suggestions_agent_id').on(table.agentId),
    idxType: index('idx_agent_suggestions_type').on(table.suggestionType),
    idxConfidence: index('idx_agent_suggestions_confidence').on(
      table.confidence
    ),
    idxUserFeedback: index('idx_agent_suggestions_user_feedback').on(
      table.userFeedback
    ),
    idxCreatedAt: index('idx_agent_suggestions_created_at').on(
      table.createdAt
    ),
    idxApprovedAt: index('idx_agent_suggestions_approved_at').on(
      table.approvedAt
    ),

    // JSONB index for content queries
    idxContent: index('idx_agent_suggestions_content').on(table.content),
  })
);

// ============================================================================
// RELATIONSHIPS
// ============================================================================

/**
 * Relations for agent suggestions
 */
export const agentSuggestionsRelations = relations(
  agentSuggestions,
  ({ one, many }) => ({
    agent: one(agentLearningContexts, {
      fields: [agentSuggestions.agentId],
      references: [agentLearningContexts.id],
    }),
    approvedRecords: many(agentApprovedRecords),
  })
);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Type for agent suggestion row
 */
export type AgentSuggestion = typeof agentSuggestions.$inferSelect;

/**
 * Type for inserting a new agent suggestion
 */
export type NewAgentSuggestion = typeof agentSuggestions.$inferInsert;

/**
 * Suggestion content structure
 */
export interface SuggestionContent {
  value: string | number | boolean;
  field?: string;
  reasoning?: string;
  examples?: (string | number)[];
  alternatives?: (string | number)[];
  metadata?: Record<string, unknown>;
}

/**
 * Suggestion type literal
 */
export type SuggestionType =
  | 'autocomplete'
  | 'data_import'
  | 'field_value'
  | 'duplicate_detection'
  | 'pattern_recognition'
  | 'relationship_suggestion';

/**
 * User feedback type literal
 */
export type UserFeedback = 'approved' | 'rejected' | 'modified';

/**
 * Suggestion source type
 */
export type SuggestionSource = 'pattern' | 'history' | 'file' | 'relationship';

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Suggestion with agent information
 */
export type SuggestionWithAgent = AgentSuggestion & {
  agent: typeof agentLearningContexts.$inferSelect;
};

/**
 * Suggestion statistics
 */
export interface SuggestionStats {
  total: number;
  approved: number;
  rejected: number;
  modified: number;
  averageConfidence: number;
  approvalRate: number;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default agentSuggestions;
