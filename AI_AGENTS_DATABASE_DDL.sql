-- ============================================================================
-- AI Agents System - Database Definition Language (DDL)
-- VendHub Showcase - Contextual AI Agents Database Schema
-- ============================================================================
-- 
-- This file contains the complete SQL DDL for the AI Agents system.
-- It includes all 5 core tables with indexes, constraints, and relationships.
--
-- Tables:
-- 1. agent_learning_contexts - Stores agent learning data and context
-- 2. agent_suggestions - Stores AI-generated suggestions
-- 3. agent_file_uploads - Stores file upload metadata and analysis
-- 4. agent_interactions - Stores interaction history for audit trail
-- 5. agent_approved_records - Stores approved suggestions as database records
--
-- Created: November 30, 2025
-- Version: 1.0
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable JSON support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Agent types
CREATE TYPE agent_type_enum AS ENUM ('machines', 'tasks', 'products');

-- Suggestion types
CREATE TYPE suggestion_type_enum AS ENUM (
  'autocomplete',
  'data_import',
  'field_value',
  'duplicate_detection',
  'pattern_recognition',
  'relationship_suggestion'
);

-- User feedback types
CREATE TYPE user_feedback_enum AS ENUM ('approved', 'rejected', 'modified');

-- File types
CREATE TYPE file_type_enum AS ENUM ('csv', 'xlsx', 'json', 'pdf', 'txt');

-- Interaction types
CREATE TYPE interaction_type_enum AS ENUM (
  'suggestion_generated',
  'file_uploaded',
  'file_analyzed',
  'data_imported',
  'feedback_recorded',
  'learning_updated'
);

-- Record types
CREATE TYPE record_type_enum AS ENUM ('machine', 'task', 'product', 'operator', 'custom');

-- ============================================================================
-- TABLE 1: agent_learning_contexts
-- ============================================================================
-- 
-- Purpose: Stores the learning context and accumulated knowledge for each agent
-- 
-- Key Concepts:
-- - Each agent has a learning context specific to its domain
-- - Learning data is stored as JSONB for flexibility
-- - File references link to uploaded files that contributed to learning
-- - Version tracking allows for learning context evolution
--
-- Example:
-- {
--   "machine_models": ["VendMaster 3000", "CoolBox Pro"],
--   "locations": ["Main Street", "Airport"],
--   "patterns": {
--     "model_frequency": {"VendMaster 3000": 0.65, "CoolBox Pro": 0.35},
--     "location_distribution": {"Main Street": 0.4, "Airport": 0.6}
--   }
-- }
--

CREATE TABLE agent_learning_contexts (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Agent Identification
  agent_type agent_type_enum NOT NULL,
  section_name VARCHAR(100) NOT NULL,
  
  -- Learning Data (JSONB for flexibility)
  learning_data JSONB NOT NULL DEFAULT '{}',
  
  -- File References
  file_references UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Audit
  created_by UUID,
  updated_by UUID,
  
  -- Constraints
  CONSTRAINT agent_learning_contexts_unique_agent 
    UNIQUE(agent_type, section_name)
);

-- Indexes for agent_learning_contexts
CREATE INDEX idx_agent_learning_contexts_agent_type 
  ON agent_learning_contexts(agent_type);

CREATE INDEX idx_agent_learning_contexts_section_name 
  ON agent_learning_contexts(section_name);

CREATE INDEX idx_agent_learning_contexts_updated_at 
  ON agent_learning_contexts(updated_at DESC);

CREATE INDEX idx_agent_learning_contexts_created_at 
  ON agent_learning_contexts(created_at DESC);

-- JSONB index for faster queries on learning_data
CREATE INDEX idx_agent_learning_contexts_learning_data 
  ON agent_learning_contexts USING GIN (learning_data);

-- Comments
COMMENT ON TABLE agent_learning_contexts IS 
  'Stores accumulated knowledge and learning context for each AI agent. Each agent type (machines, tasks, products) has its own learning context that improves over time.';

COMMENT ON COLUMN agent_learning_contexts.id IS 
  'Unique identifier for the learning context';

COMMENT ON COLUMN agent_learning_contexts.agent_type IS 
  'Type of agent (machines, tasks, products)';

COMMENT ON COLUMN agent_learning_contexts.section_name IS 
  'Name of the section where this agent operates';

COMMENT ON COLUMN agent_learning_contexts.learning_data IS 
  'JSONB object containing learned patterns, frequencies, relationships, and other knowledge';

COMMENT ON COLUMN agent_learning_contexts.file_references IS 
  'Array of file IDs that were analyzed and contributed to this learning context';

COMMENT ON COLUMN agent_learning_contexts.version IS 
  'Version number for tracking learning context evolution';

-- ============================================================================
-- TABLE 2: agent_suggestions
-- ============================================================================
--
-- Purpose: Stores AI-generated suggestions for user approval
--
-- Key Concepts:
-- - Each suggestion is generated by an agent based on learning context
-- - Suggestions have confidence scores (0-1)
-- - User feedback (approved/rejected/modified) is recorded
-- - Suggestions are tracked for learning and improvement
--
-- Example:
-- {
--   "value": "VendMaster 3000",
--   "field": "machine_model",
--   "reasoning": "Most common model in uploaded data (65%)",
--   "examples": ["M001", "M002", "M003"]
-- }
--

CREATE TABLE agent_suggestions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationship to Learning Context
  agent_id UUID NOT NULL REFERENCES agent_learning_contexts(id) ON DELETE CASCADE,
  
  -- Suggestion Details
  suggestion_type suggestion_type_enum NOT NULL,
  content JSONB NOT NULL,
  
  -- Confidence and Source
  confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  source VARCHAR(50) NOT NULL DEFAULT 'pattern', -- 'pattern', 'history', 'file', 'relationship'
  reasoning TEXT,
  
  -- User Feedback
  user_feedback user_feedback_enum,
  feedback_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- User Information
  created_by_agent BOOLEAN DEFAULT TRUE,
  approved_by UUID,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Indexes for agent_suggestions
CREATE INDEX idx_agent_suggestions_agent_id 
  ON agent_suggestions(agent_id);

CREATE INDEX idx_agent_suggestions_type 
  ON agent_suggestions(suggestion_type);

CREATE INDEX idx_agent_suggestions_confidence 
  ON agent_suggestions(confidence DESC);

CREATE INDEX idx_agent_suggestions_user_feedback 
  ON agent_suggestions(user_feedback);

CREATE INDEX idx_agent_suggestions_created_at 
  ON agent_suggestions(created_at DESC);

CREATE INDEX idx_agent_suggestions_approved_at 
  ON agent_suggestions(approved_at DESC);

-- JSONB index for content queries
CREATE INDEX idx_agent_suggestions_content 
  ON agent_suggestions USING GIN (content);

-- Comments
COMMENT ON TABLE agent_suggestions IS 
  'Stores AI-generated suggestions that are presented to users for approval. Tracks user feedback for continuous learning.';

COMMENT ON COLUMN agent_suggestions.id IS 
  'Unique identifier for the suggestion';

COMMENT ON COLUMN agent_suggestions.agent_id IS 
  'Foreign key to the agent that generated this suggestion';

COMMENT ON COLUMN agent_suggestions.suggestion_type IS 
  'Type of suggestion (autocomplete, data_import, field_value, etc.)';

COMMENT ON COLUMN agent_suggestions.content IS 
  'JSONB object containing the suggestion value and metadata';

COMMENT ON COLUMN agent_suggestions.confidence IS 
  'Confidence score from 0 to 1 indicating how confident the agent is in this suggestion';

COMMENT ON COLUMN agent_suggestions.user_feedback IS 
  'User action on the suggestion (approved, rejected, modified)';

-- ============================================================================
-- TABLE 3: agent_file_uploads
-- ============================================================================
--
-- Purpose: Tracks file uploads and stores analysis results
--
-- Key Concepts:
-- - Each file upload is tracked with metadata
-- - Analysis results are stored for reference
-- - Extracted data can be large, so it's stored as JSONB
-- - Files are linked to the agent that analyzed them
--
-- Example Analysis Result:
-- {
--   "parsing": {
--     "success": true,
--     "rowsProcessed": 150,
--     "errors": [],
--     "warnings": ["Column 'status' has 5 null values"]
--   },
--   "patterns": {
--     "machine_model": {
--       "VendMaster 3000": 0.65,
--       "CoolBox Pro": 0.35
--     }
--   },
--   "quality": {
--     "completeness": 0.95,
--     "validity": 0.98,
--     "uniqueness": 0.92
--   }
-- }
--

CREATE TABLE agent_file_uploads (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationship to Agent
  agent_id UUID NOT NULL REFERENCES agent_learning_contexts(id) ON DELETE CASCADE,
  
  -- File Information
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type file_type_enum NOT NULL,
  file_size INTEGER NOT NULL, -- in bytes
  file_hash VARCHAR(64), -- SHA-256 hash for duplicate detection
  
  -- Analysis Results
  analysis_result JSONB,
  extracted_data JSONB,
  
  -- Status
  upload_status VARCHAR(20) NOT NULL DEFAULT 'uploaded', -- 'uploading', 'uploaded', 'analyzing', 'analyzed', 'failed'
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  analyzed_at TIMESTAMP WITH TIME ZONE,
  
  -- User Information
  uploaded_by UUID NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Indexes for agent_file_uploads
CREATE INDEX idx_agent_file_uploads_agent_id 
  ON agent_file_uploads(agent_id);

CREATE INDEX idx_agent_file_uploads_file_type 
  ON agent_file_uploads(file_type);

CREATE INDEX idx_agent_file_uploads_created_at 
  ON agent_file_uploads(created_at DESC);

CREATE INDEX idx_agent_file_uploads_upload_status 
  ON agent_file_uploads(upload_status);

CREATE INDEX idx_agent_file_uploads_file_hash 
  ON agent_file_uploads(file_hash);

-- JSONB indexes for analysis results
CREATE INDEX idx_agent_file_uploads_analysis_result 
  ON agent_file_uploads USING GIN (analysis_result);

CREATE INDEX idx_agent_file_uploads_extracted_data 
  ON agent_file_uploads USING GIN (extracted_data);

-- Comments
COMMENT ON TABLE agent_file_uploads IS 
  'Tracks all file uploads and stores the analysis results performed by agents. Used for audit trail and learning data source tracking.';

COMMENT ON COLUMN agent_file_uploads.id IS 
  'Unique identifier for the file upload';

COMMENT ON COLUMN agent_file_uploads.agent_id IS 
  'Foreign key to the agent that analyzed this file';

COMMENT ON COLUMN agent_file_uploads.file_name IS 
  'Original name of the uploaded file';

COMMENT ON COLUMN agent_file_uploads.file_path IS 
  'Storage path where the file is saved';

COMMENT ON COLUMN agent_file_uploads.file_hash IS 
  'SHA-256 hash of file content for duplicate detection';

COMMENT ON COLUMN agent_file_uploads.analysis_result IS 
  'JSONB object containing parsing results, patterns, and quality metrics';

COMMENT ON COLUMN agent_file_uploads.extracted_data IS 
  'JSONB array of extracted records from the file';

-- ============================================================================
-- TABLE 4: agent_interactions
-- ============================================================================
--
-- Purpose: Audit trail of all agent interactions and user feedback
--
-- Key Concepts:
-- - Every agent action is logged for audit trail
-- - User feedback on suggestions is recorded
-- - Interactions are used to improve agent learning
-- - Complete history allows for analysis and debugging
--
-- Example:
-- {
--   "action": "suggestion_generated",
--   "input": {"field": "machine_model", "context": {...}},
--   "output": {"suggestion": "VendMaster 3000", "confidence": 0.95},
--   "userAction": "approved"
-- }
--

CREATE TABLE agent_interactions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationship to Agent
  agent_id UUID NOT NULL REFERENCES agent_learning_contexts(id) ON DELETE CASCADE,
  
  -- Interaction Details
  interaction_type interaction_type_enum NOT NULL,
  input_data JSONB,
  output_data JSONB,
  
  -- User Action and Feedback
  user_action VARCHAR(20), -- 'accepted', 'rejected', 'modified', 'ignored'
  user_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- User Information
  user_id UUID,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Performance Metrics
  processing_time_ms INTEGER, -- milliseconds
  confidence_score FLOAT CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1))
);

-- Indexes for agent_interactions
CREATE INDEX idx_agent_interactions_agent_id 
  ON agent_interactions(agent_id);

CREATE INDEX idx_agent_interactions_type 
  ON agent_interactions(interaction_type);

CREATE INDEX idx_agent_interactions_user_action 
  ON agent_interactions(user_action);

CREATE INDEX idx_agent_interactions_created_at 
  ON agent_interactions(created_at DESC);

CREATE INDEX idx_agent_interactions_user_id 
  ON agent_interactions(user_id);

-- JSONB indexes for data queries
CREATE INDEX idx_agent_interactions_input_data 
  ON agent_interactions USING GIN (input_data);

CREATE INDEX idx_agent_interactions_output_data 
  ON agent_interactions USING GIN (output_data);

-- Composite index for common queries
CREATE INDEX idx_agent_interactions_agent_type_date 
  ON agent_interactions(agent_id, created_at DESC);

-- Comments
COMMENT ON TABLE agent_interactions IS 
  'Complete audit trail of all agent interactions. Records every action taken by agents and user feedback for learning and debugging.';

COMMENT ON COLUMN agent_interactions.id IS 
  'Unique identifier for the interaction';

COMMENT ON COLUMN agent_interactions.agent_id IS 
  'Foreign key to the agent that performed this interaction';

COMMENT ON COLUMN agent_interactions.interaction_type IS 
  'Type of interaction (suggestion_generated, file_uploaded, feedback_recorded, etc.)';

COMMENT ON COLUMN agent_interactions.input_data IS 
  'JSONB object containing input data for this interaction';

COMMENT ON COLUMN agent_interactions.output_data IS 
  'JSONB object containing output/result of this interaction';

COMMENT ON COLUMN agent_interactions.user_action IS 
  'User action taken on the agent output (accepted, rejected, modified, ignored)';

COMMENT ON COLUMN agent_interactions.processing_time_ms IS 
  'Time taken to process this interaction in milliseconds';

-- ============================================================================
-- TABLE 5: agent_approved_records
-- ============================================================================
--
-- Purpose: Stores approved agent suggestions as database records
--
-- Key Concepts:
-- - When user approves a suggestion, it becomes a record
-- - Links back to original suggestion for traceability
-- - Can be edited like any other record
-- - Tracks which records were created by agents vs manually
--
-- Example:
-- {
--   "id": "M001",
--   "model": "VendMaster 3000",
--   "location": "Main Street",
--   "status": "Online"
-- }
--

CREATE TABLE agent_approved_records (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  agent_id UUID NOT NULL REFERENCES agent_learning_contexts(id) ON DELETE SET NULL,
  original_suggestion_id UUID REFERENCES agent_suggestions(id) ON DELETE SET NULL,
  
  -- Record Information
  record_type record_type_enum NOT NULL,
  record_data JSONB NOT NULL,
  
  -- Reference to Main Database Record
  record_id UUID,
  record_table VARCHAR(100), -- table name where record is stored
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'created', -- 'created', 'modified', 'archived'
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by_agent BOOLEAN DEFAULT TRUE,
  
  -- User Information
  created_by UUID,
  approved_by UUID,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Indexes for agent_approved_records
CREATE INDEX idx_agent_approved_records_agent_id 
  ON agent_approved_records(agent_id);

CREATE INDEX idx_agent_approved_records_suggestion_id 
  ON agent_approved_records(original_suggestion_id);

CREATE INDEX idx_agent_approved_records_record_type 
  ON agent_approved_records(record_type);

CREATE INDEX idx_agent_approved_records_record_id 
  ON agent_approved_records(record_id);

CREATE INDEX idx_agent_approved_records_created_at 
  ON agent_approved_records(created_at DESC);

CREATE INDEX idx_agent_approved_records_status 
  ON agent_approved_records(status);

-- JSONB index for record data queries
CREATE INDEX idx_agent_approved_records_data 
  ON agent_approved_records USING GIN (record_data);

-- Composite index for common queries
CREATE INDEX idx_agent_approved_records_agent_type_date 
  ON agent_approved_records(agent_id, created_at DESC);

-- Comments
COMMENT ON TABLE agent_approved_records IS 
  'Stores approved agent suggestions as actual database records. Provides traceability back to original suggestion and allows records to be edited like any other record.';

COMMENT ON COLUMN agent_approved_records.id IS 
  'Unique identifier for the approved record';

COMMENT ON COLUMN agent_approved_records.agent_id IS 
  'Foreign key to the agent that created the suggestion';

COMMENT ON COLUMN agent_approved_records.original_suggestion_id IS 
  'Foreign key to the original suggestion that was approved';

COMMENT ON COLUMN agent_approved_records.record_type IS 
  'Type of record (machine, task, product, operator, custom)';

COMMENT ON COLUMN agent_approved_records.record_data IS 
  'JSONB object containing the actual record data';

COMMENT ON COLUMN agent_approved_records.record_id IS 
  'ID of the corresponding record in the main database table';

COMMENT ON COLUMN agent_approved_records.created_by_agent IS 
  'Boolean indicating if this record was created by an agent (true) or manually (false)';

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Agent Statistics
CREATE VIEW agent_statistics AS
SELECT 
  alc.agent_type,
  alc.section_name,
  COUNT(DISTINCT as_id.id) as total_suggestions,
  COUNT(DISTINCT CASE WHEN as_id.user_feedback = 'approved' THEN as_id.id END) as approved_suggestions,
  COUNT(DISTINCT CASE WHEN as_id.user_feedback = 'rejected' THEN as_id.id END) as rejected_suggestions,
  COUNT(DISTINCT CASE WHEN as_id.user_feedback = 'modified' THEN as_id.id END) as modified_suggestions,
  ROUND(AVG(CASE WHEN as_id.user_feedback = 'approved' THEN as_id.confidence ELSE NULL END)::NUMERIC, 3) as avg_confidence_approved,
  COUNT(DISTINCT afu.id) as total_files_uploaded,
  COUNT(DISTINCT ai.id) as total_interactions,
  alc.updated_at as last_updated
FROM agent_learning_contexts alc
LEFT JOIN agent_suggestions as_id ON alc.id = as_id.agent_id
LEFT JOIN agent_file_uploads afu ON alc.id = afu.agent_id
LEFT JOIN agent_interactions ai ON alc.id = ai.agent_id
GROUP BY alc.id, alc.agent_type, alc.section_name, alc.updated_at;

COMMENT ON VIEW agent_statistics IS 
  'Provides statistics about agent performance including suggestion counts, approval rates, and interaction metrics.';

-- View: Recent Interactions
CREATE VIEW recent_interactions AS
SELECT 
  ai.id,
  alc.agent_type,
  alc.section_name,
  ai.interaction_type,
  ai.user_action,
  ai.processing_time_ms,
  ai.confidence_score,
  ai.created_at,
  ai.user_id
FROM agent_interactions ai
JOIN agent_learning_contexts alc ON ai.agent_id = alc.id
ORDER BY ai.created_at DESC
LIMIT 1000;

COMMENT ON VIEW recent_interactions IS 
  'Shows the 1000 most recent agent interactions for monitoring and debugging.';

-- View: Suggestion Approval Rate
CREATE VIEW suggestion_approval_rate AS
SELECT 
  alc.agent_type,
  alc.section_name,
  as_id.suggestion_type,
  COUNT(*) as total_suggestions,
  COUNT(CASE WHEN as_id.user_feedback = 'approved' THEN 1 END) as approved,
  COUNT(CASE WHEN as_id.user_feedback = 'rejected' THEN 1 END) as rejected,
  COUNT(CASE WHEN as_id.user_feedback = 'modified' THEN 1 END) as modified,
  ROUND(
    (COUNT(CASE WHEN as_id.user_feedback = 'approved' THEN 1 END)::FLOAT / 
     NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as approval_rate_percent,
  ROUND(AVG(as_id.confidence)::NUMERIC, 3) as avg_confidence
FROM agent_learning_contexts alc
JOIN agent_suggestions as_id ON alc.id = as_id.agent_id
WHERE as_id.user_feedback IS NOT NULL
GROUP BY alc.agent_type, alc.section_name, as_id.suggestion_type
ORDER BY alc.agent_type, alc.section_name, as_id.suggestion_type;

COMMENT ON VIEW suggestion_approval_rate IS 
  'Shows approval rates for suggestions by agent type, section, and suggestion type.';

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Update agent learning context timestamp
CREATE OR REPLACE FUNCTION update_agent_learning_contexts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  NEW.version = NEW.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update agent_learning_contexts timestamp
CREATE TRIGGER trigger_agent_learning_contexts_updated_at
BEFORE UPDATE ON agent_learning_contexts
FOR EACH ROW
EXECUTE FUNCTION update_agent_learning_contexts_updated_at();

-- Function: Calculate suggestion confidence
CREATE OR REPLACE FUNCTION calculate_suggestion_confidence()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure confidence is between 0 and 1
  IF NEW.confidence < 0 THEN
    NEW.confidence = 0;
  ELSIF NEW.confidence > 1 THEN
    NEW.confidence = 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Validate suggestion confidence
CREATE TRIGGER trigger_validate_suggestion_confidence
BEFORE INSERT OR UPDATE ON agent_suggestions
FOR EACH ROW
EXECUTE FUNCTION calculate_suggestion_confidence();

-- ============================================================================
-- GRANTS (Adjust based on your user roles)
-- ============================================================================

-- Grant permissions to application user (adjust 'app_user' as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON agent_learning_contexts TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON agent_suggestions TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON agent_file_uploads TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON agent_interactions TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON agent_approved_records TO app_user;

-- Grant SELECT on views
-- GRANT SELECT ON agent_statistics TO app_user;
-- GRANT SELECT ON recent_interactions TO app_user;
-- GRANT SELECT ON suggestion_approval_rate TO app_user;

-- ============================================================================
-- SAMPLE QUERIES
-- ============================================================================

-- Query 1: Get all learning contexts
-- SELECT * FROM agent_learning_contexts;

-- Query 2: Get suggestions for a specific agent
-- SELECT * FROM agent_suggestions 
-- WHERE agent_id = 'agent-uuid-here'
-- ORDER BY created_at DESC;

-- Query 3: Get approval statistics
-- SELECT * FROM suggestion_approval_rate
-- WHERE agent_type = 'machines'
-- ORDER BY approval_rate_percent DESC;

-- Query 4: Get recent interactions
-- SELECT * FROM recent_interactions
-- LIMIT 50;

-- Query 5: Get file upload history
-- SELECT 
--   afu.file_name,
--   afu.file_type,
--   afu.file_size,
--   afu.upload_status,
--   COUNT(DISTINCT ai.id) as interaction_count,
--   afu.created_at
-- FROM agent_file_uploads afu
-- LEFT JOIN agent_interactions ai ON afu.id::text = ai.metadata->>'file_id'
-- GROUP BY afu.id, afu.file_name, afu.file_type, afu.file_size, afu.upload_status, afu.created_at
-- ORDER BY afu.created_at DESC;

-- ============================================================================
-- END OF DDL
-- ============================================================================
