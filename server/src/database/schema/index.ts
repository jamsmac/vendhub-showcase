/**
 * Agent Schema Index
 * 
 * Central export point for all agent-related database schemas and types.
 * 
 * @module database/schema
 */

// ============================================================================
// AGENT LEARNING CONTEXTS
// ============================================================================

export {
  agentLearningContexts,
  agentTypeEnum,
  type AgentLearningContext,
  type NewAgentLearningContext,
  type LearningData,
  type AgentType,
} from './agent-learning-contexts';

// ============================================================================
// AGENT SUGGESTIONS
// ============================================================================

export {
  agentSuggestions,
  agentSuggestionsRelations,
  suggestionTypeEnum,
  userFeedbackEnum,
  type AgentSuggestion,
  type NewAgentSuggestion,
  type SuggestionContent,
  type SuggestionType,
  type UserFeedback,
  type SuggestionSource,
  type SuggestionWithAgent,
  type SuggestionStats,
} from './agent-suggestions';

// ============================================================================
// AGENT FILE UPLOADS
// ============================================================================

export {
  agentFileUploads,
  agentFileUploadsRelations,
  fileTypeEnum,
  type AgentFileUpload,
  type NewAgentFileUpload,
  type FileType,
  type UploadStatus,
  type AnalysisResult,
  type ExtractedData,
  type FileUploadWithAgent,
  type FileUploadStats,
  type FileUploadWithAnalysis,
} from './agent-file-uploads';

// ============================================================================
// AGENT INTERACTIONS
// ============================================================================

export {
  agentInteractions,
  agentInteractionsRelations,
  interactionTypeEnum,
  VALID_USER_ACTIONS,
  VALID_INTERACTION_TYPES,
  type AgentInteraction,
  type NewAgentInteraction,
  type InteractionType,
  type UserAction,
  type InteractionInputData,
  type InteractionOutputData,
  type InteractionWithAgent,
  type InteractionStats,
  type InteractionTimelineEntry,
  type InteractionQueryResult,
} from './agent-interactions';

// ============================================================================
// AGENT APPROVED RECORDS
// ============================================================================

export {
  agentApprovedRecords,
  agentApprovedRecordsRelations,
  recordTypeEnum,
  VALID_RECORD_TYPES,
  VALID_RECORD_STATUSES,
  RECORD_TYPE_DESCRIPTIONS,
  type AgentApprovedRecord,
  type NewAgentApprovedRecord,
  type RecordType,
  type RecordStatus,
  type RecordData,
  type ApprovedRecordWithAgent,
  type ApprovedRecordWithSuggestion,
  type ApprovedRecordWithRelations,
  type ApprovedRecordStats,
  type RecordCreationResult,
  type BulkRecordCreationResult,
} from './agent-approved-records';

// ============================================================================
// SCHEMA OBJECT
// ============================================================================

import agentLearningContexts from './agent-learning-contexts';
import agentSuggestions from './agent-suggestions';
import agentFileUploads from './agent-file-uploads';
import agentInteractions from './agent-interactions';
import agentApprovedRecords from './agent-approved-records';

/**
 * Complete agent schema object
 * Contains all tables and can be used with Drizzle ORM
 */
export const agentSchema = {
  agentLearningContexts,
  agentSuggestions,
  agentFileUploads,
  agentInteractions,
  agentApprovedRecords,
};

/**
 * All agent tables for schema export
 */
export const agentTables = [
  agentLearningContexts,
  agentSuggestions,
  agentFileUploads,
  agentInteractions,
  agentApprovedRecords,
];

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * All agent types union
 */
export type AllAgentTypes =
  | 'machines'
  | 'tasks'
  | 'products';

/**
 * All suggestion types union
 */
export type AllSuggestionTypes =
  | 'autocomplete'
  | 'data_import'
  | 'field_value'
  | 'duplicate_detection'
  | 'pattern_recognition'
  | 'relationship_suggestion';

/**
 * All interaction types union
 */
export type AllInteractionTypes =
  | 'suggestion_generated'
  | 'file_uploaded'
  | 'file_analyzed'
  | 'data_imported'
  | 'feedback_recorded'
  | 'learning_updated';

/**
 * All record types union
 */
export type AllRecordTypes =
  | 'machine'
  | 'task'
  | 'product'
  | 'operator'
  | 'custom';

// ============================================================================
// BATCH TYPES
// ============================================================================

/**
 * Batch operation result
 */
export interface BatchOperationResult<T> {
  success: boolean;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  results: T[];
  errors?: Array<{
    index: number;
    error: string;
  }>;
}

/**
 * Query options for agent queries
 */
export interface AgentQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: 'asc' | 'desc';
  orderByField?: string;
}

/**
 * Filter options for agent queries
 */
export interface AgentFilterOptions {
  agentType?: AllAgentTypes;
  sectionName?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default agentSchema;
