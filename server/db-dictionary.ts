/**
 * Database functions for Dictionary Items
 * Handles CRUD operations for reference book entries with multilingual support
 */

import { getDb } from "./db";
import { dictionaryItems, InsertDictionaryItem } from "../drizzle/schema";
import { eq, and, like, or, ne } from "drizzle-orm";

const db = getDb();

/**
 * Get all dictionary items for a specific dictionary code
 */
export async function getDictionaryItems(
  dictionaryCode: string,
  activeOnly: boolean = true
) {
  let query = db
    .select()
    .from(dictionaryItems)
    .where(eq(dictionaryItems.dictionaryCode, dictionaryCode));

  if (activeOnly) {
    query = query.where(eq(dictionaryItems.is_active, true));
  }

  return await query.orderBy(dictionaryItems.sort_order);
}

/**
 * Get a single dictionary item by code
 */
export async function getDictionaryItem(
  dictionaryCode: string,
  code: string
) {
  const result = await db
    .select()
    .from(dictionaryItems)
    .where(
      and(
        eq(dictionaryItems.dictionaryCode, dictionaryCode),
        eq(dictionaryItems.code, code)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Get dictionary items by ID
 */
export async function getDictionaryItemById(id: number) {
  const result = await db
    .select()
    .from(dictionaryItems)
    .where(eq(dictionaryItems.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * Search dictionary items by name or code
 */
export async function searchDictionaryItems(
  dictionaryCode: string,
  searchTerm: string,
  activeOnly: boolean = true
) {
  let query = db
    .select()
    .from(dictionaryItems)
    .where(eq(dictionaryItems.dictionaryCode, dictionaryCode));

  if (activeOnly) {
    query = query.where(eq(dictionaryItems.is_active, true));
  }

  // Search in code, name, and all language variants
  const searchPattern = `%${searchTerm}%`;
  query = query.where(
    or(
      like(dictionaryItems.code, searchPattern),
      like(dictionaryItems.name, searchPattern),
      like(dictionaryItems.name_en, searchPattern),
      like(dictionaryItems.name_ru, searchPattern),
      like(dictionaryItems.name_uz, searchPattern)
    )
  );

  return await query.orderBy(dictionaryItems.sort_order);
}

/**
 * Create a new dictionary item
 */
export async function createDictionaryItem(
  data: InsertDictionaryItem
) {
  const result = await db.insert(dictionaryItems).values(data);
  return result;
}

/**
 * Update a dictionary item
 */
export async function updateDictionaryItem(
  id: number,
  data: Partial<InsertDictionaryItem>
) {
  const result = await db
    .update(dictionaryItems)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(dictionaryItems.id, id));

  return result;
}

/**
 * Delete a dictionary item
 */
export async function deleteDictionaryItem(id: number) {
  const result = await db
    .delete(dictionaryItems)
    .where(eq(dictionaryItems.id, id));

  return result;
}

/**
 * Delete all items for a dictionary code
 */
export async function deleteDictionaryItems(dictionaryCode: string) {
  const result = await db
    .delete(dictionaryItems)
    .where(eq(dictionaryItems.dictionaryCode, dictionaryCode));

  return result;
}

/**
 * Bulk create dictionary items
 */
export async function bulkCreateDictionaryItems(
  items: InsertDictionaryItem[]
) {
  const result = await db.insert(dictionaryItems).values(items);
  return result;
}

/**
 * Toggle active status of a dictionary item
 */
export async function toggleDictionaryItemStatus(
  id: number,
  isActive: boolean
) {
  const result = await db
    .update(dictionaryItems)
    .set({
      is_active: isActive,
      updatedAt: new Date(),
    })
    .where(eq(dictionaryItems.id, id));

  return result;
}

/**
 * Get dictionary items count
 */
export async function getDictionaryItemsCount(
  dictionaryCode: string,
  activeOnly: boolean = true
) {
  let query = db
    .select()
    .from(dictionaryItems)
    .where(eq(dictionaryItems.dictionaryCode, dictionaryCode));

  if (activeOnly) {
    query = query.where(eq(dictionaryItems.is_active, true));
  }

  const result = await query;
  return result.length;
}

/**
 * Reorder dictionary items
 */
export async function reorderDictionaryItems(
  items: Array<{ id: number; sort_order: number }>
) {
  const updates = items.map((item) =>
    db
      .update(dictionaryItems)
      .set({
        sort_order: item.sort_order,
        updatedAt: new Date(),
      })
      .where(eq(dictionaryItems.id, item.id))
  );

  return await Promise.all(updates);
}

/**
 * Check if dictionary item code exists
 */
export async function dictionaryItemCodeExists(
  dictionaryCode: string,
  code: string,
  excludeId?: number
) {
  let query = db
    .select()
    .from(dictionaryItems)
    .where(
      and(
        eq(dictionaryItems.dictionaryCode, dictionaryCode),
        eq(dictionaryItems.code, code)
      )
    );

  if (excludeId) {
    query = query.where(ne(dictionaryItems.id, excludeId));
  }

  const result = await query.limit(1);
  return result.length > 0;
}


export async function bulkDeleteDictionaryItems(ids: number[]): Promise<number> {
  const db = getDb();
  const { dictionaryItems } = await import('../drizzle/schema');
  const { inArray } = await import('drizzle-orm');
  
  const result = await db.delete(dictionaryItems).where(inArray(dictionaryItems.id, ids));
  return ids.length;
}

export async function bulkToggleDictionaryItems(ids: number[], status: boolean): Promise<number> {
  const db = getDb();
  const { dictionaryItems } = await import('../drizzle/schema');
  const { inArray } = await import('drizzle-orm');
  
  await db.update(dictionaryItems)
    .set({ is_active: status })
    .where(inArray(dictionaryItems.id, ids));
  
  return ids.length;
}

export async function getDictionaryItemsByIds(ids: number[]): Promise<DictionaryItem[]> {
  const db = getDb();
  const { dictionaryItems } = await import('../drizzle/schema');
  const { inArray } = await import('drizzle-orm');
  
  if (ids.length === 0) return [];
  
  return await db.select().from(dictionaryItems)
    .where(inArray(dictionaryItems.id, ids))
    .orderBy(dictionaryItems.sort_order, dictionaryItems.id);
}

