# Drizzle ORM Agent Schemas - Usage Guide

Complete guide for using the Drizzle ORM schemas for the AI Agents system.

## 📁 File Structure

```
server/src/database/schema/
├── agent-learning-contexts.ts    # Learning context schema
├── agent-suggestions.ts          # Suggestions schema
├── agent-file-uploads.ts         # File uploads schema
├── agent-interactions.ts         # Interactions schema
├── agent-approved-records.ts     # Approved records schema
└── index.ts                      # Central export point
```

## 🚀 Quick Start

### 1. Import Schemas

```typescript
import {
  agentLearningContexts,
  agentSuggestions,
  agentFileUploads,
  agentInteractions,
  agentApprovedRecords,
  agentSchema,
} from '@/database/schema';

// Or import types
import type {
  AgentLearningContext,
  AgentSuggestion,
  AgentFileUpload,
  AgentInteraction,
  AgentApprovedRecord,
} from '@/database/schema';
```

### 2. Use with Drizzle ORM

```typescript
import { db } from '@/database';

// Select all learning contexts
const contexts = await db.select().from(agentLearningContexts);

// Select with filters
const machinesContext = await db
  .select()
  .from(agentLearningContexts)
  .where(eq(agentLearningContexts.agentType, 'machines'));

// Insert new context
const newContext = await db
  .insert(agentLearningContexts)
  .values({
    agentType: 'machines',
    sectionName: 'Main Warehouse',
    learningData: {
      machine_models: ['VendMaster 3000', 'CoolBox Pro'],
      patterns: {},
    },
  })
  .returning();

// Update context
await db
  .update(agentLearningContexts)
  .set({
    learningData: { ...updatedData },
    updatedAt: new Date(),
    version: version + 1,
  })
  .where(eq(agentLearningContexts.id, contextId));
```

## 📊 Table Schemas

### 1. Agent Learning Contexts

Stores accumulated knowledge for each agent.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `agentType` (enum): 'machines' | 'tasks' | 'products'
- `sectionName` (varchar): Name of the section
- `learningData` (JSONB): Flexible knowledge storage
- `fileReferences` (UUID[]): Array of file IDs
- `createdAt` (timestamp): Creation time
- `updatedAt` (timestamp): Last update time
- `version` (integer): Version number
- `createdBy` (UUID): Creator ID
- `updatedBy` (UUID): Last updater ID

**Unique Constraint:**
- `(agentType, sectionName)` - One context per agent type per section

**Example Usage:**

```typescript
// Create learning context
const context = await db
  .insert(agentLearningContexts)
  .values({
    agentType: 'machines',
    sectionName: 'Warehouse A',
    learningData: {
      machine_models: ['VendMaster 3000'],
      patterns: {
        model_frequency: { 'VendMaster 3000': 1.0 },
      },
    },
  })
  .returning();

// Get context with relationships
const contextWithData = await db.query.agentLearningContexts.findFirst({
  where: eq(agentLearningContexts.id, contextId),
  with: {
    suggestions: true,
    fileUploads: true,
    interactions: true,
    approvedRecords: true,
  },
});

// Update learning data
await db
  .update(agentLearningContexts)
  .set({
    learningData: sql`jsonb_set(learning_data, '{patterns,model_frequency}', '"VendMaster 3000": 0.8, "CoolBox Pro": 0.2'::jsonb)`,
  })
  .where(eq(agentLearningContexts.id, contextId));
```

### 2. Agent Suggestions

Stores AI-generated suggestions awaiting user approval.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `agentId` (UUID, FK): Reference to learning context
- `suggestionType` (enum): Type of suggestion
- `content` (JSONB): Suggestion content
- `confidence` (float): Confidence score (0-1)
- `source` (varchar): Source of suggestion
- `reasoning` (text): Explanation
- `userFeedback` (enum): 'approved' | 'rejected' | 'modified'
- `feedbackNotes` (text): User notes
- `createdAt` (timestamp): Creation time
- `approvedAt` (timestamp): Approval time
- `createdByAgent` (boolean): Whether created by agent
- `approvedBy` (UUID): Approver ID
- `metadata` (JSONB): Additional metadata

**Example Usage:**

```typescript
// Create suggestion
const suggestion = await db
  .insert(agentSuggestions)
  .values({
    agentId: contextId,
    suggestionType: 'field_value',
    content: {
      value: 'VendMaster 3000',
      field: 'machine_model',
      reasoning: 'Most common model (65%)',
      examples: ['M001', 'M002', 'M003'],
    },
    confidence: 0.95,
    source: 'pattern',
    reasoning: 'Based on historical data analysis',
  })
  .returning();

// Get approved suggestions
const approvedSuggestions = await db
  .select()
  .from(agentSuggestions)
  .where(
    and(
      eq(agentSuggestions.agentId, contextId),
      eq(agentSuggestions.userFeedback, 'approved')
    )
  )
  .orderBy(desc(agentSuggestions.confidence));

// Update suggestion with feedback
await db
  .update(agentSuggestions)
  .set({
    userFeedback: 'approved',
    approvedAt: new Date(),
    approvedBy: userId,
    feedbackNotes: 'Looks good',
  })
  .where(eq(agentSuggestions.id, suggestionId));

// Get statistics
const stats = await db
  .select({
    total: count(),
    approved: count(
      sql`CASE WHEN user_feedback = 'approved' THEN 1 END`
    ),
    avgConfidence: avg(agentSuggestions.confidence),
  })
  .from(agentSuggestions)
  .where(eq(agentSuggestions.agentId, contextId));
```

### 3. Agent File Uploads

Tracks file uploads and analysis results.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `agentId` (UUID, FK): Reference to learning context
- `fileName` (varchar): Original file name
- `filePath` (varchar): Storage path
- `fileType` (enum): 'csv' | 'xlsx' | 'json' | 'pdf' | 'txt'
- `fileSize` (integer): File size in bytes
- `fileHash` (varchar): SHA-256 hash
- `analysisResult` (JSONB): Analysis results
- `extractedData` (JSONB): Extracted records
- `uploadStatus` (varchar): Upload status
- `errorMessage` (text): Error message if failed
- `createdAt` (timestamp): Upload time
- `analyzedAt` (timestamp): Analysis time
- `uploadedBy` (UUID): Uploader ID
- `metadata` (JSONB): Additional metadata

**Example Usage:**

```typescript
// Create file upload record
const fileUpload = await db
  .insert(agentFileUploads)
  .values({
    agentId: contextId,
    fileName: 'machines.csv',
    filePath: '/uploads/machines-2025-11-30.csv',
    fileType: 'csv',
    fileSize: 15000,
    fileHash: 'abc123def456...',
    uploadStatus: 'uploaded',
    uploadedBy: userId,
  })
  .returning();

// Update with analysis results
await db
  .update(agentFileUploads)
  .set({
    uploadStatus: 'analyzed',
    analyzedAt: new Date(),
    analysisResult: {
      parsing: {
        success: true,
        rowsProcessed: 150,
        errors: [],
      },
      patterns: {
        machine_model: {
          'VendMaster 3000': 0.65,
          'CoolBox Pro': 0.35,
        },
      },
    },
    extractedData: [
      { id: 'M001', model: 'VendMaster 3000', location: 'Main Street' },
      { id: 'M002', model: 'CoolBox Pro', location: 'Airport' },
    ],
  })
  .where(eq(agentFileUploads.id, fileUploadId));

// Get recent uploads
const recentUploads = await db
  .select()
  .from(agentFileUploads)
  .where(eq(agentFileUploads.agentId, contextId))
  .orderBy(desc(agentFileUploads.createdAt))
  .limit(10);

// Find duplicate files by hash
const duplicate = await db
  .select()
  .from(agentFileUploads)
  .where(eq(agentFileUploads.fileHash, fileHash))
  .limit(1);
```

### 4. Agent Interactions

Complete audit trail of all interactions.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `agentId` (UUID, FK): Reference to learning context
- `interactionType` (enum): Type of interaction
- `inputData` (JSONB): Input data
- `outputData` (JSONB): Output data
- `userAction` (varchar): User action
- `userNotes` (text): User notes
- `createdAt` (timestamp): Interaction time
- `userId` (UUID): User ID
- `metadata` (JSONB): Additional metadata
- `processingTimeMs` (integer): Processing time
- `confidenceScore` (float): Confidence score

**Example Usage:**

```typescript
// Log interaction
const interaction = await db
  .insert(agentInteractions)
  .values({
    agentId: contextId,
    interactionType: 'suggestion_generated',
    inputData: {
      field: 'machine_model',
      context: { /* ... */ },
    },
    outputData: {
      suggestion: 'VendMaster 3000',
      confidence: 0.95,
    },
    userId: userId,
    processingTimeMs: 145,
    confidenceScore: 0.95,
  })
  .returning();

// Update with user action
await db
  .update(agentInteractions)
  .set({
    userAction: 'accepted',
    userNotes: 'Correct suggestion',
  })
  .where(eq(agentInteractions.id, interactionId));

// Get interaction timeline
const timeline = await db
  .select()
  .from(agentInteractions)
  .where(eq(agentInteractions.agentId, contextId))
  .orderBy(desc(agentInteractions.createdAt))
  .limit(100);

// Get performance metrics
const metrics = await db
  .select({
    avgProcessingTime: avg(agentInteractions.processingTimeMs),
    avgConfidence: avg(agentInteractions.confidenceScore),
    totalInteractions: count(),
  })
  .from(agentInteractions)
  .where(eq(agentInteractions.agentId, contextId));
```

### 5. Agent Approved Records

Approved suggestions stored as database records.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `agentId` (UUID, FK): Reference to learning context
- `originalSuggestionId` (UUID, FK): Reference to suggestion
- `recordType` (enum): Type of record
- `recordData` (JSONB): Record content
- `recordId` (UUID): Reference to main database record
- `recordTable` (varchar): Main table name
- `status` (varchar): Record status
- `createdAt` (timestamp): Creation time
- `createdByAgent` (boolean): Whether created by agent
- `createdBy` (UUID): Creator ID
- `approvedBy` (UUID): Approver ID
- `metadata` (JSONB): Additional metadata

**Example Usage:**

```typescript
// Create approved record
const approvedRecord = await db
  .insert(agentApprovedRecords)
  .values({
    agentId: contextId,
    originalSuggestionId: suggestionId,
    recordType: 'machine',
    recordData: {
      id: 'M001',
      model: 'VendMaster 3000',
      location: 'Main Street',
      status: 'Online',
    },
    recordId: machineId,
    recordTable: 'machines',
    createdByAgent: true,
    approvedBy: userId,
  })
  .returning();

// Get records created by agents
const agentCreatedRecords = await db
  .select()
  .from(agentApprovedRecords)
  .where(
    and(
      eq(agentApprovedRecords.agentId, contextId),
      eq(agentApprovedRecords.createdByAgent, true)
    )
  );

// Update record status
await db
  .update(agentApprovedRecords)
  .set({
    status: 'modified',
  })
  .where(eq(agentApprovedRecords.id, recordId));

// Get record statistics
const stats = await db
  .select({
    totalRecords: count(),
    byType: sql`jsonb_object_agg(record_type, count)`,
    createdByAgent: count(
      sql`CASE WHEN created_by_agent THEN 1 END`
    ),
  })
  .from(agentApprovedRecords)
  .where(eq(agentApprovedRecords.agentId, contextId));
```

## 🔗 Relationships

### One-to-Many Relationships

```typescript
// Get context with all related data
const contextWithAll = await db.query.agentLearningContexts.findFirst({
  where: eq(agentLearningContexts.id, contextId),
  with: {
    suggestions: true,
    fileUploads: true,
    interactions: true,
    approvedRecords: true,
  },
});

// Access related data
contextWithAll?.suggestions.forEach((suggestion) => {
  console.log(suggestion.content);
});
```

### Many-to-One Relationships

```typescript
// Get suggestion with agent context
const suggestionWithAgent = await db.query.agentSuggestions.findFirst({
  where: eq(agentSuggestions.id, suggestionId),
  with: {
    agent: true,
  },
});

console.log(suggestionWithAgent?.agent.sectionName);
```

## 📈 Common Queries

### Get Agent Statistics

```typescript
const stats = await db
  .select({
    agentType: agentLearningContexts.agentType,
    sectionName: agentLearningContexts.sectionName,
    totalSuggestions: count(agentSuggestions.id),
    approvedSuggestions: count(
      sql`CASE WHEN user_feedback = 'approved' THEN 1 END`
    ),
    totalFiles: count(agentFileUploads.id),
    totalInteractions: count(agentInteractions.id),
  })
  .from(agentLearningContexts)
  .leftJoin(
    agentSuggestions,
    eq(agentLearningContexts.id, agentSuggestions.agentId)
  )
  .leftJoin(
    agentFileUploads,
    eq(agentLearningContexts.id, agentFileUploads.agentId)
  )
  .leftJoin(
    agentInteractions,
    eq(agentLearningContexts.id, agentInteractions.agentId)
  )
  .groupBy(agentLearningContexts.id);
```

### Get Recent Activity

```typescript
const recentActivity = await db
  .select({
    type: sql`'suggestion'`,
    id: agentSuggestions.id,
    createdAt: agentSuggestions.createdAt,
  })
  .from(agentSuggestions)
  .union(
    db
      .select({
        type: sql`'file'`,
        id: agentFileUploads.id,
        createdAt: agentFileUploads.createdAt,
      })
      .from(agentFileUploads)
  )
  .union(
    db
      .select({
        type: sql`'interaction'`,
        id: agentInteractions.id,
        createdAt: agentInteractions.createdAt,
      })
      .from(agentInteractions)
  )
  .orderBy(desc(sql`created_at`))
  .limit(50);
```

### Get Approval Rate

```typescript
const approvalRate = await db
  .select({
    agentType: agentLearningContexts.agentType,
    suggestionType: agentSuggestions.suggestionType,
    total: count(),
    approved: count(
      sql`CASE WHEN user_feedback = 'approved' THEN 1 END`
    ),
    approvalRate: sql`ROUND(COUNT(CASE WHEN user_feedback = 'approved' THEN 1 END)::FLOAT / COUNT(*) * 100, 2)`,
  })
  .from(agentLearningContexts)
  .innerJoin(
    agentSuggestions,
    eq(agentLearningContexts.id, agentSuggestions.agentId)
  )
  .where(isNotNull(agentSuggestions.userFeedback))
  .groupBy(agentLearningContexts.agentType, agentSuggestions.suggestionType);
```

## 🛠️ Type Safety

All schemas include full TypeScript type definitions:

```typescript
import type {
  AgentLearningContext,
  NewAgentLearningContext,
  AgentSuggestion,
  NewAgentSuggestion,
  AgentFileUpload,
  NewAgentFileUpload,
  AgentInteraction,
  NewAgentInteraction,
  AgentApprovedRecord,
  NewAgentApprovedRecord,
} from '@/database/schema';

// Use types for function parameters
async function createSuggestion(
  suggestion: NewAgentSuggestion
): Promise<AgentSuggestion> {
  return db
    .insert(agentSuggestions)
    .values(suggestion)
    .returning()
    .then((rows) => rows[0]);
}

// Use types for return values
async function getContext(
  id: string
): Promise<AgentLearningContext | undefined> {
  return db
    .select()
    .from(agentLearningContexts)
    .where(eq(agentLearningContexts.id, id))
    .then((rows) => rows[0]);
}
```

## 📚 Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JSONB Guide](https://www.postgresql.org/docs/current/datatype-json.html)

## ✅ Checklist

- [ ] Import schemas in your project
- [ ] Set up database connection
- [ ] Run migrations
- [ ] Test basic CRUD operations
- [ ] Implement query helpers
- [ ] Add error handling
- [ ] Set up logging
- [ ] Write unit tests
- [ ] Document custom queries
- [ ] Set up monitoring

---

**All schemas are ready for production use! 🚀**
