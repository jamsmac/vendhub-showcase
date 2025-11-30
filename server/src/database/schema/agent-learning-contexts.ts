/**
 * Agent Learning Contexts Schema
 * 
 * Stores the accumulated knowledge and learning context for each AI agent.
 * Each agent type (machines, tasks, products) has its own learning context
 * that improves over time based on user interactions and file uploads.
 * 
 * @module database/schema/agent-learning-contexts
 */

import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  integer,
  array,
  uniqueIndex,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';

import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Agent type enum - defines the type of agent
 * @enum {string}
 */
export const agentTypeEnum = pgEnum('agent_type_enum', [
  'machines',
  'tasks',
  'products',
]);

// ============================================================================
// TABLE DEFINITION
// ============================================================================

/**
 * Agent Learning Contexts Table
 * 
 * Stores the learning context and accumulated knowledge for each agent.
 * 
 * Example learning_data:
 * ```json
 * {
 *   "machine_models": ["VendMaster 3000", "CoolBox Pro"],
 *   "locations": ["Main Street", "Airport"],
 *   "patterns": {
 *     "model_frequency": {
 *       "VendMaster 3000": 0.65,
 *       "CoolBox Pro": 0.35
 *     },
 *     "location_distribution": {
 *       "Main Street": 0.4,
 *       "Airport": 0.6
 *     }
 *   },
 *   "relationships": {
 *     "model_to_location": {
 *       "VendMaster 3000": ["Main Street", "Airport"],
 *       "CoolBox Pro": ["Airport"]
 *     }
 *   }
 * }
 * ```
 */
export const agentLearningContexts = pgTable(
  'agent_learning_contexts',
  {
    // Primary Key
    id: uuid('id').primaryKey().defaultRandom(),

    // Agent Identification
    agentType: agentTypeEnum('agent_type').notNull(),
    sectionName: varchar('section_name', { length: 100 }).notNull(),

    // Learning Data
    learningData: jsonb('learning_data').notNull().default('{}'),

    // File References
    fileReferences: array(uuid('file_references')).default([]),

    // Metadata
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    version: integer('version').notNull().default(1),

    // Audit
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
  },
  (table) => ({
    // Unique constraint on agent type and section name
    uniqueAgentSection: uniqueIndex('agent_learning_contexts_unique_agent')
      .on(table.agentType, table.sectionName),

    // Indexes for common queries
    idxAgentType: index('idx_agent_learning_contexts_agent_type').on(
      table.agentType
    ),
    idxSectionName: index('idx_agent_learning_contexts_section_name').on(
      table.sectionName
    ),
    idxUpdatedAt: index('idx_agent_learning_contexts_updated_at').on(
      table.updatedAt
    ),
    idxCreatedAt: index('idx_agent_learning_contexts_created_at').on(
      table.createdAt
    ),

    // JSONB index for learning data queries
    idxLearningData: index('idx_agent_learning_contexts_learning_data').on(
      table.learningData
    ),
  })
);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Type for agent learning context row
 */
export type AgentLearningContext = typeof agentLearningContexts.$inferSelect;

/**
 * Type for inserting a new agent learning context
 */
export type NewAgentLearningContext = typeof agentLearningContexts.$inferInsert;

/**
 * Learning data structure
 */
export interface LearningData {
  [key: string]: unknown;
  machine_models?: string[];
  locations?: string[];
  patterns?: Record<string, Record<string, number>>;
  relationships?: Record<string, string[]>;
  frequencies?: Record<string, number>;
  categories?: string[];
  tags?: string[];
}

/**
 * Agent type literal
 */
export type AgentType = 'machines' | 'tasks' | 'products';

// ============================================================================
// EXPORTS
// ============================================================================

export default agentLearningContexts;
