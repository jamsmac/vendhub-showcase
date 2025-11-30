/**
 * Agent File Uploads Schema
 * 
 * Tracks file uploads and stores analysis results performed by agents.
 * Used for audit trail and learning data source tracking.
 * 
 * @module database/schema/agent-file-uploads
 */

import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  integer,
  text,
  index,
  pgEnum,
  foreignKey,
} from 'drizzle-orm/pg-core';

import { relations } from 'drizzle-orm';
import { agentLearningContexts } from './agent-learning-contexts';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * File type enum - defines the type of uploaded file
 * @enum {string}
 */
export const fileTypeEnum = pgEnum('file_type_enum', [
  'csv',
  'xlsx',
  'json',
  'pdf',
  'txt',
]);

// ============================================================================
// TABLE DEFINITION
// ============================================================================

/**
 * Agent File Uploads Table
 * 
 * Tracks all file uploads and stores the analysis results performed by agents.
 * 
 * Example analysis_result:
 * ```json
 * {
 *   "parsing": {
 *     "success": true,
 *     "rowsProcessed": 150,
 *     "errors": [],
 *     "warnings": ["Column 'status' has 5 null values"]
 *   },
 *   "patterns": {
 *     "machine_model": {
 *       "VendMaster 3000": 0.65,
 *       "CoolBox Pro": 0.35
 *     }
 *   },
 *   "quality": {
 *     "completeness": 0.95,
 *     "validity": 0.98,
 *     "uniqueness": 0.92
 *   }
 * }
 * ```
 * 
 * Example extracted_data:
 * ```json
 * [
 *   {
 *     "id": "M001",
 *     "model": "VendMaster 3000",
 *     "location": "Main Street",
 *     "status": "Online"
 *   },
 *   {
 *     "id": "M002",
 *     "model": "CoolBox Pro",
 *     "location": "Airport",
 *     "status": "Maintenance"
 *   }
 * ]
 * ```
 */
export const agentFileUploads = pgTable(
  'agent_file_uploads',
  {
    // Primary Key
    id: uuid('id').primaryKey().defaultRandom(),

    // Relationship to Agent
    agentId: uuid('agent_id')
      .notNull()
      .references(() => agentLearningContexts.id, { onDelete: 'cascade' }),

    // File Information
    fileName: varchar('file_name', { length: 255 }).notNull(),
    filePath: varchar('file_path', { length: 500 }).notNull(),
    fileType: fileTypeEnum('file_type').notNull(),
    fileSize: integer('file_size').notNull(),
    fileHash: varchar('file_hash', { length: 64 }),

    // Analysis Results
    analysisResult: jsonb('analysis_result'),
    extractedData: jsonb('extracted_data'),

    // Status
    uploadStatus: varchar('upload_status', { length: 20 })
      .notNull()
      .default('uploaded'),
    errorMessage: text('error_message'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    analyzedAt: timestamp('analyzed_at', { withTimezone: true }),

    // User Information
    uploadedBy: uuid('uploaded_by').notNull(),

    // Metadata
    metadata: jsonb('metadata').default('{}'),
  },
  (table) => ({
    // Foreign key constraint
    fkAgentId: foreignKey({
      columns: [table.agentId],
      foreignColumns: [agentLearningContexts.id],
      name: 'agent_file_uploads_agent_id_fk',
    }),

    // Indexes for common queries
    idxAgentId: index('idx_agent_file_uploads_agent_id').on(table.agentId),
    idxFileType: index('idx_agent_file_uploads_file_type').on(table.fileType),
    idxCreatedAt: index('idx_agent_file_uploads_created_at').on(
      table.createdAt
    ),
    idxUploadStatus: index('idx_agent_file_uploads_upload_status').on(
      table.uploadStatus
    ),
    idxFileHash: index('idx_agent_file_uploads_file_hash').on(table.fileHash),

    // JSONB indexes for analysis results
    idxAnalysisResult: index('idx_agent_file_uploads_analysis_result').on(
      table.analysisResult
    ),
    idxExtractedData: index('idx_agent_file_uploads_extracted_data').on(
      table.extractedData
    ),
  })
);

// ============================================================================
// RELATIONSHIPS
// ============================================================================

/**
 * Relations for agent file uploads
 */
export const agentFileUploadsRelations = relations(
  agentFileUploads,
  ({ one }) => ({
    agent: one(agentLearningContexts, {
      fields: [agentFileUploads.agentId],
      references: [agentLearningContexts.id],
    }),
  })
);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Type for agent file upload row
 */
export type AgentFileUpload = typeof agentFileUploads.$inferSelect;

/**
 * Type for inserting a new agent file upload
 */
export type NewAgentFileUpload = typeof agentFileUploads.$inferInsert;

/**
 * File type literal
 */
export type FileType = 'csv' | 'xlsx' | 'json' | 'pdf' | 'txt';

/**
 * Upload status type
 */
export type UploadStatus = 'uploading' | 'uploaded' | 'analyzing' | 'analyzed' | 'failed';

/**
 * Analysis result structure
 */
export interface AnalysisResult {
  parsing?: {
    success: boolean;
    rowsProcessed?: number;
    columnsProcessed?: number;
    errors?: string[];
    warnings?: string[];
  };
  patterns?: Record<string, Record<string, number>>;
  quality?: {
    completeness?: number;
    validity?: number;
    uniqueness?: number;
  };
  statistics?: Record<string, unknown>;
}

/**
 * Extracted data structure
 */
export type ExtractedData = Record<string, unknown>[];

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * File upload with agent information
 */
export type FileUploadWithAgent = AgentFileUpload & {
  agent: typeof agentLearningContexts.$inferSelect;
};

/**
 * File upload statistics
 */
export interface FileUploadStats {
  totalFiles: number;
  totalSize: number;
  averageSize: number;
  fileTypeDistribution: Record<FileType, number>;
  successRate: number;
}

/**
 * File upload with analysis
 */
export interface FileUploadWithAnalysis extends AgentFileUpload {
  analysis: AnalysisResult;
  extractedRecords: ExtractedData;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default agentFileUploads;
