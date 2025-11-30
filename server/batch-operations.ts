/**
 * Batch Operations Handler
 * 
 * Handles bulk import/export operations with:
 * - Transaction tracking
 * - Error recovery and rollback
 * - Batch validation and processing
 * - Detailed error logging
 */

import { getDb } from "./db";
import * as dbImport from "./db-import";
import { dictionaryItems } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export interface BatchOperationResult {
  success: boolean;
  importHistoryId: number;
  totalProcessed: number;
  successfulRecords: number;
  failedRecords: number;
  errors: BatchError[];
  message: string;
}

export interface BatchError {
  recordIndex: number;
  originalData: any;
  errorMessage: string;
  operation: "insert" | "update" | "delete";
}

/**
 * Process bulk import with transaction tracking
 */
export async function processBulkImport(
  dictionaryCode: string,
  fileName: string,
  items: any[],
  mode: "create" | "update" | "upsert",
  performedBy: number,
  skipErrors: boolean = false
): Promise<BatchOperationResult> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Create import history record
  const historyResult = await dbImport.createImportHistory({
    dictionaryCode,
    fileName,
    totalRecords: items.length,
    importMode: mode,
    performedBy,
  });

  const importHistoryId = historyResult.insertId || 0;
  const errors: BatchError[] = [];
  let successfulRecords = 0;
  let failedRecords = 0;

  try {
    // Process each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      try {
        // Create batch transaction record
        await dbImport.createBatchTransaction({
          importHistoryId,
          recordIndex: i,
          originalData: JSON.stringify(item),
          modifiedData: JSON.stringify(item),
          operation: mode === "create" ? "insert" : mode === "update" ? "update" : "insert",
        });

        // Process based on mode
        if (mode === "create") {
          await db.insert(dictionaryItems).values({
            dictionaryCode: item.dictionaryCode || dictionaryCode,
            code: item.code,
            name: item.name,
            name_en: item.name_en,
            name_ru: item.name_ru,
            name_uz: item.name_uz,
            description: item.description,
            description_en: item.description_en,
            description_ru: item.description_ru,
            description_uz: item.description_uz,
            icon: item.icon,
            color: item.color,
            symbol: item.symbol,
            sort_order: item.sort_order || 0,
            is_active: item.is_active !== false,
            createdBy: performedBy,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else if (mode === "update") {
          await db
            .update(dictionaryItems)
            .set({
              name: item.name,
              name_en: item.name_en,
              name_ru: item.name_ru,
              name_uz: item.name_uz,
              description: item.description,
              description_en: item.description_en,
              description_ru: item.description_ru,
              description_uz: item.description_uz,
              icon: item.icon,
              color: item.color,
              symbol: item.symbol,
              sort_order: item.sort_order,
              is_active: item.is_active,
              updatedBy: performedBy,
              updatedAt: new Date(),
            })
            .where(eq(dictionaryItems.code, item.code));
        } else if (mode === "upsert") {
          const existing = await db
            .select()
            .from(dictionaryItems)
            .where(eq(dictionaryItems.code, item.code))
            .limit(1);

          if (existing.length > 0) {
            await db
              .update(dictionaryItems)
              .set({
                name: item.name,
                name_en: item.name_en,
                name_ru: item.name_ru,
                name_uz: item.name_uz,
                description: item.description,
                description_en: item.description_en,
                description_ru: item.description_ru,
                description_uz: item.description_uz,
                icon: item.icon,
                color: item.color,
                symbol: item.symbol,
                sort_order: item.sort_order,
                is_active: item.is_active,
                updatedBy: performedBy,
                updatedAt: new Date(),
              })
              .where(eq(dictionaryItems.code, item.code));
          } else {
            await db.insert(dictionaryItems).values({
              dictionaryCode: item.dictionaryCode || dictionaryCode,
              code: item.code,
              name: item.name,
              name_en: item.name_en,
              name_ru: item.name_ru,
              name_uz: item.name_uz,
              description: item.description,
              description_en: item.description_en,
              description_ru: item.description_ru,
              description_uz: item.description_uz,
              icon: item.icon,
              color: item.color,
              symbol: item.symbol,
              sort_order: item.sort_order || 0,
              is_active: item.is_active !== false,
              createdBy: performedBy,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }

        successfulRecords++;

        // Update batch transaction status
        await dbImport.updateBatchTransaction(i, {
          status: "success",
        });
      } catch (error) {
        failedRecords++;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        errors.push({
          recordIndex: i,
          originalData: item,
          errorMessage,
          operation: mode === "create" ? "insert" : "update",
        });

        // Update batch transaction with error
        await dbImport.updateBatchTransaction(i, {
          status: "failed",
          errorMessage,
        });

        // Stop processing if skipErrors is false
        if (!skipErrors) {
          throw error;
        }
      }
    }

    // Update import history with final status
    await dbImport.updateImportHistory(importHistoryId, {
      status: failedRecords > 0 && !skipErrors ? "failed" : "completed",
      successfulRecords,
      failedRecords,
      errorLog: errors.length > 0 ? JSON.stringify(errors, null, 2) : undefined,
    });

    // Create undo/redo entry
    await dbImport.createUndoRedoEntry({
      importHistoryId,
      action: "import",
      newState: JSON.stringify({
        dictionaryCode,
        totalRecords: items.length,
        successfulRecords,
        failedRecords,
      }),
      performedBy,
    });

    return {
      success: failedRecords === 0 || skipErrors,
      importHistoryId,
      totalProcessed: items.length,
      successfulRecords,
      failedRecords,
      errors,
      message:
        failedRecords === 0
          ? `Successfully imported ${successfulRecords} records`
          : `Imported ${successfulRecords} records with ${failedRecords} errors`,
    };
  } catch (error) {
    // Update import history with error status
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await dbImport.updateImportHistory(importHistoryId, {
      status: "failed",
      successfulRecords,
      failedRecords,
      errorLog: errorMessage,
    });

    throw error;
  }
}

/**
 * Rollback a completed import operation
 */
export async function rollbackImport(
  importHistoryId: number,
  performedBy: number
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get import history
  const history = await dbImport.getImportHistory(importHistoryId);
  if (!history) {
    throw new Error("Import history not found");
  }

  if (history.status === "rolled_back") {
    throw new Error("This import has already been rolled back");
  }

  // Get batch transactions
  const transactions = await dbImport.getBatchTransactions(importHistoryId);

  try {
    // Reverse each transaction
    for (const transaction of transactions) {
      if (transaction.status === "success") {
        const originalData = JSON.parse(transaction.originalData);

        // Delete the inserted/updated record
        await db
          .delete(dictionaryItems)
          .where(eq(dictionaryItems.code, originalData.code));
      }
    }

    // Update import history
    await dbImport.updateImportHistory(importHistoryId, {
      status: "rolled_back",
      rolledBackAt: new Date(),
      rolledBackBy: performedBy,
    });

    // Create undo/redo entry for rollback
    await dbImport.createUndoRedoEntry({
      importHistoryId,
      action: "rollback",
      previousState: JSON.stringify({
        successfulRecords: history.successfulRecords,
        failedRecords: history.failedRecords,
      }),
      performedBy,
    });
  } catch (error) {
    throw new Error(
      `Failed to rollback import: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get batch operation errors
 */
export async function getBatchErrors(
  importHistoryId: number
): Promise<BatchError[]> {
  const transactions = await dbImport.getBatchTransactions(importHistoryId);

  return transactions
    .filter((t) => t.status === "failed" && t.errorMessage)
    .map((t) => ({
      recordIndex: t.recordIndex,
      originalData: JSON.parse(t.originalData),
      errorMessage: t.errorMessage || "Unknown error",
      operation: t.operation,
    }));
}

/**
 * Validate batch data before import
 */
export function validateBatchData(items: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  items.forEach((item, index) => {
    if (!item.code) {
      errors.push(`Row ${index + 1}: Code is required`);
    }
    if (!item.name) {
      errors.push(`Row ${index + 1}: Name is required`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
