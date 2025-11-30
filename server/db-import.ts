/**
 * Database functions for import history, batch transactions, and undo/redo operations
 */

import { getDb } from "./db";
import { importHistory, batchTransactions, undoRedoStack } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// Import History Functions
export async function createImportHistory(data: {
  dictionaryCode: string;
  fileName: string;
  totalRecords: number;
  importMode: "create" | "update" | "upsert";
  performedBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(importHistory).values({
    dictionaryCode: data.dictionaryCode,
    fileName: data.fileName,
    totalRecords: data.totalRecords,
    successfulRecords: 0,
    failedRecords: 0,
    status: "in_progress",
    importMode: data.importMode,
    performedBy: data.performedBy,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return result;
}

export async function getImportHistory(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(importHistory)
    .where(eq(importHistory.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getImportHistoryByDictionary(dictionaryCode: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(importHistory)
    .where(eq(importHistory.dictionaryCode, dictionaryCode))
    .orderBy(desc(importHistory.createdAt));
}

export async function updateImportHistory(
  id: number,
  data: {
    status?: "pending" | "in_progress" | "completed" | "failed" | "rolled_back";
    successfulRecords?: number;
    failedRecords?: number;
    errorLog?: string;
    rolledBackAt?: Date;
    rolledBackBy?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (data.status !== undefined) updateData.status = data.status;
  if (data.successfulRecords !== undefined)
    updateData.successfulRecords = data.successfulRecords;
  if (data.failedRecords !== undefined) updateData.failedRecords = data.failedRecords;
  if (data.errorLog !== undefined) updateData.errorLog = data.errorLog;
  if (data.rolledBackAt !== undefined) updateData.rolledBackAt = data.rolledBackAt;
  if (data.rolledBackBy !== undefined) updateData.rolledBackBy = data.rolledBackBy;

  const result = await db
    .update(importHistory)
    .set(updateData)
    .where(eq(importHistory.id, id));

  return result;
}

// Batch Transaction Functions
export async function createBatchTransaction(data: {
  importHistoryId: number;
  recordIndex: number;
  originalData: string;
  modifiedData: string;
  operation: "insert" | "update" | "delete";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(batchTransactions).values({
    importHistoryId: data.importHistoryId,
    recordIndex: data.recordIndex,
    originalData: data.originalData,
    modifiedData: data.modifiedData,
    operation: data.operation,
    status: "pending",
    createdAt: new Date(),
  });

  return result;
}

export async function getBatchTransactions(importHistoryId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(batchTransactions)
    .where(eq(batchTransactions.importHistoryId, importHistoryId));
}

export async function updateBatchTransaction(
  id: number,
  data: {
    status?: "pending" | "success" | "failed";
    errorMessage?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Record<string, any> = {};

  if (data.status !== undefined) updateData.status = data.status;
  if (data.errorMessage !== undefined) updateData.errorMessage = data.errorMessage;

  const result = await db
    .update(batchTransactions)
    .set(updateData)
    .where(eq(batchTransactions.id, id));

  return result;
}

export async function deleteBatchTransactions(importHistoryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(batchTransactions)
    .where(eq(batchTransactions.importHistoryId, importHistoryId));
}

// Undo/Redo Stack Functions
export async function createUndoRedoEntry(data: {
  importHistoryId: number;
  action: "import" | "rollback";
  previousState?: string;
  newState?: string;
  performedBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(undoRedoStack).values({
    importHistoryId: data.importHistoryId,
    action: data.action,
    previousState: data.previousState || null,
    newState: data.newState || null,
    timestamp: new Date(),
    performedBy: data.performedBy,
  });

  return result;
}

export async function getUndoRedoStack(importHistoryId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(undoRedoStack)
    .where(eq(undoRedoStack.importHistoryId, importHistoryId))
    .orderBy(desc(undoRedoStack.timestamp));
}

export async function getLatestUndoRedoEntry(importHistoryId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(undoRedoStack)
    .where(eq(undoRedoStack.importHistoryId, importHistoryId))
    .orderBy(desc(undoRedoStack.timestamp))
    .limit(1);

  return result[0] || null;
}

export async function deleteUndoRedoStack(importHistoryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(undoRedoStack)
    .where(eq(undoRedoStack.importHistoryId, importHistoryId));
}
