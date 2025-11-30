/**
 * Drizzle ORM Migration for AI Agents System
 * 
 * This migration creates all 5 core tables for the AI Agents system.
 * It includes proper relationships, indexes, and constraints.
 * 
 * Generated: November 30, 2025
 * Version: 1.0
 */

import { 
  pgTable, 
  uuid, 
  text, 
  varchar, 
  integer, 
  float, 
  jsonb, 
  timestamp, 
  boolean, 
  primaryKey,
  foreignKey,
  uniqueIndex,
  index,
  pgEnum,
  array,
  check
} from 'drizzle-orm/pg-core';

import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const agentTypeEnum = pgEnum('agent_type_enum', ['machines', 'tasks', 'products']);

export const suggestionTypeEnum = pgEnum('suggestion_type_enum', [
  'autocomplete',
  'data_import',
  'field_value',
  'duplicate_detection',
  'pattern_recognition',
  'relationship_suggestion'
]);

export const userFeedbackEnum = pgEnum('user_feedback_enum', [
  'approved',
  'rejected',
  'modified'
]);

export const fileTypeEnum = pgEnum('file_type_enum', [
  'csv',
  'xlsx',
  'json',
  'pdf',
  'txt'
]);

export const interactionTypeEnum = pgEnum('interaction_type_enum', [
  'suggestion_generated',
  'file_uploaded',
  'file_analyzed',
  'data_imported',
  'feedback_recorded',
  'learning_updated'
]);

export const recordTypeEnum = pgEnum('record_type_enum', [
  'machine',
  'task',
  'product',
  'operator',
  'custom'
]);

// ============================================================================
// TABLE 1: agent_learning_contexts
// ============================================================================

export const agentLearningContexts = pgTable(
  'agent_learning_contexts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentType: agentTypeEnum('agent_type').notNull(),
    sectionName: varchar('section_name', { length: 100 }).notNull(),
    learningData: jsonb('learning_data').notNull().default('{}'),
    fileReferences: array(uuid('file_references')).default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    version: integer('version').notNull().default(1),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
  },
  (table) => ({
    uniqueAgentSection: uniqueIndex('agent_learning_contexts_unique_agent')
      .on(table.agentType, table.sectionName),
    idxAgentType: index('idx_agent_learning_contexts_agent_type')
      .on(table.agentType),
    idxSectionName: index('idx_agent_learning_contexts_section_name')
      .on(table.sectionName),
    idxUpdatedAt: index('idx_agent_learning_contexts_updated_at')
      .on(table.updatedAt),
    idxCreatedAt: index('idx_agent_learning_contexts_created_at')
      .on(table.createdAt),
    idxLearningData: index('idx_agent_learning_contexts_learning_data')
      .on(table.learningData),
  })
);

// ============================================================================
// TABLE 2: agent_suggestions
// ============================================================================

export const agentSuggestions = pgTable(
  'agent_suggestions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => agentLearningContexts.id, { onDelete: 'cascade' }),
    suggestionType: suggestionTypeEnum('suggestion_type').notNull(),
    content: jsonb('content').notNull(),
    confidence: float('confidence').notNull(),
    source: varchar('source', { length: 50 }).notNull().default('pattern'),
    reasoning: text('reasoning'),
    userFeedback: userFeedbackEnum('user_feedback'),
    feedbackNotes: text('feedback_notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    createdByAgent: boolean('created_by_agent').default(true),
    approvedBy: uuid('approved_by'),
    metadata: jsonb('metadata').default('{}'),
  },
  (table) => ({
    idxAgentId: index('idx_agent_suggestions_agent_id')
      .on(table.agentId),
    idxType: index('idx_agent_suggestions_type')
      .on(table.suggestionType),
    idxConfidence: index('idx_agent_suggestions_confidence')
      .on(table.confidence),
    idxUserFeedback: index('idx_agent_suggestions_user_feedback')
      .on(table.userFeedback),
    idxCreatedAt: index('idx_agent_suggestions_created_at')
      .on(table.createdAt),
    idxApprovedAt: index('idx_agent_suggestions_approved_at')
      .on(table.approvedAt),
    idxContent: index('idx_agent_suggestions_content')
      .on(table.content),
    confidenceCheck: check('confidence_check', sql`confidence >= 0 AND confidence <= 1`),
  })
);

// ============================================================================
// TABLE 3: agent_file_uploads
// ============================================================================

export const agentFileUploads = pgTable(
  'agent_file_uploads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => agentLearningContexts.id, { onDelete: 'cascade' }),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    filePath: varchar('file_path', { length: 500 }).notNull(),
    fileType: fileTypeEnum('file_type').notNull(),
    fileSize: integer('file_size').notNull(),
    fileHash: varchar('file_hash', { length: 64 }),
    analysisResult: jsonb('analysis_result'),
    extractedData: jsonb('extracted_data'),
    uploadStatus: varchar('upload_status', { length: 20 }).notNull().default('uploaded'),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    analyzedAt: timestamp('analyzed_at', { withTimezone: true }),
    uploadedBy: uuid('uploaded_by').notNull(),
    metadata: jsonb('metadata').default('{}'),
  },
  (table) => ({
    idxAgentId: index('idx_agent_file_uploads_agent_id')
      .on(table.agentId),
    idxFileType: index('idx_agent_file_uploads_file_type')
      .on(table.fileType),
    idxCreatedAt: index('idx_agent_file_uploads_created_at')
      .on(table.createdAt),
    idxUploadStatus: index('idx_agent_file_uploads_upload_status')
      .on(table.uploadStatus),
    idxFileHash: index('idx_agent_file_uploads_file_hash')
      .on(table.fileHash),
    idxAnalysisResult: index('idx_agent_file_uploads_analysis_result')
      .on(table.analysisResult),
    idxExtractedData: index('idx_agent_file_uploads_extracted_data')
      .on(table.extractedData),
  })
);

// ============================================================================
// TABLE 4: agent_interactions
// ============================================================================

export const agentInteractions = pgTable(
  'agent_interactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => agentLearningContexts.id, { onDelete: 'cascade' }),
    interactionType: interactionTypeEnum('interaction_type').notNull(),
    inputData: jsonb('input_data'),
    outputData: jsonb('output_data'),
    userAction: varchar('user_action', { length: 20 }),
    userNotes: text('user_notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    userId: uuid('user_id'),
    metadata: jsonb('metadata').default('{}'),
    processingTimeMs: integer('processing_time_ms'),
    confidenceScore: float('confidence_score'),
  },
  (table) => ({
    idxAgentId: index('idx_agent_interactions_agent_id')
      .on(table.agentId),
    idxType: index('idx_agent_interactions_type')
      .on(table.interactionType),
    idxUserAction: index('idx_agent_interactions_user_action')
      .on(table.userAction),
    idxCreatedAt: index('idx_agent_interactions_created_at')
      .on(table.createdAt),
    idxUserId: index('idx_agent_interactions_user_id')
      .on(table.userId),
    idxInputData: index('idx_agent_interactions_input_data')
      .on(table.inputData),
    idxOutputData: index('idx_agent_interactions_output_data')
      .on(table.outputData),
    idxAgentTypeDate: index('idx_agent_interactions_agent_type_date')
      .on(table.agentId, table.createdAt),
    confidenceCheck: check('confidence_check', sql`confidence_score >= 0 AND confidence_score <= 1`),
  })
);

// ============================================================================
// TABLE 5: agent_approved_records
// ============================================================================

export const agentApprovedRecords = pgTable(
  'agent_approved_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: uuid('agent_id')
      .references(() => agentLearningContexts.id, { onDelete: 'setNull' }),
    originalSuggestionId: uuid('original_suggestion_id')
      .references(() => agentSuggestions.id, { onDelete: 'setNull' }),
    recordType: recordTypeEnum('record_type').notNull(),
    recordData: jsonb('record_data').notNull(),
    recordId: uuid('record_id'),
    recordTable: varchar('record_table', { length: 100 }),
    status: varchar('status', { length: 20 }).notNull().default('created'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    createdByAgent: boolean('created_by_agent').default(true),
    createdBy: uuid('created_by'),
    approvedBy: uuid('approved_by'),
    metadata: jsonb('metadata').default('{}'),
  },
  (table) => ({
    idxAgentId: index('idx_agent_approved_records_agent_id')
      .on(table.agentId),
    idxSuggestionId: index('idx_agent_approved_records_suggestion_id')
      .on(table.originalSuggestionId),
    idxRecordType: index('idx_agent_approved_records_record_type')
      .on(table.recordType),
    idxRecordId: index('idx_agent_approved_records_record_id')
      .on(table.recordId),
    idxCreatedAt: index('idx_agent_approved_records_created_at')
      .on(table.createdAt),
    idxStatus: index('idx_agent_approved_records_status')
      .on(table.status),
    idxRecordData: index('idx_agent_approved_records_data')
      .on(table.recordData),
    idxAgentTypeDate: index('idx_agent_approved_records_agent_type_date')
      .on(table.agentId, table.createdAt),
  })
);

// ============================================================================
// RELATIONSHIPS
// ============================================================================

export const agentLearningContextsRelations = relations(agentLearningContexts, ({ many }) => ({
  suggestions: many(agentSuggestions),
  fileUploads: many(agentFileUploads),
  interactions: many(agentInteractions),
  approvedRecords: many(agentApprovedRecords),
}));

export const agentSuggestionsRelations = relations(agentSuggestions, ({ one, many }) => ({
  agent: one(agentLearningContexts, {
    fields: [agentSuggestions.agentId],
    references: [agentLearningContexts.id],
  }),
  approvedRecords: many(agentApprovedRecords),
}));

export const agentFileUploadsRelations = relations(agentFileUploads, ({ one }) => ({
  agent: one(agentLearningContexts, {
    fields: [agentFileUploads.agentId],
    references: [agentLearningContexts.id],
  }),
}));

export const agentInteractionsRelations = relations(agentInteractions, ({ one }) => ({
  agent: one(agentLearningContexts, {
    fields: [agentInteractions.agentId],
    references: [agentLearningContexts.id],
  }),
}));

export const agentApprovedRecordsRelations = relations(agentApprovedRecords, ({ one }) => ({
  agent: one(agentLearningContexts, {
    fields: [agentApprovedRecords.agentId],
    references: [agentLearningContexts.id],
  }),
  suggestion: one(agentSuggestions, {
    fields: [agentApprovedRecords.originalSuggestionId],
    references: [agentSuggestions.id],
  }),
}));

// ============================================================================
// EXPORT ALL TABLES
// ============================================================================

export const schema = {
  agentLearningContexts,
  agentSuggestions,
  agentFileUploads,
  agentInteractions,
  agentApprovedRecords,
};

export default schema;
