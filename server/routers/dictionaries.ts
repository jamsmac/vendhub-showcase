/**
 * tRPC Router for Dictionary Management
 * Handles CRUD operations for all 50+ reference books
 */

import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

const DictionaryItemSchema = z.object({
  id: z.number().optional(),
  dictionaryId: z.number(),
  code: z.string().min(1),
  name: z.string().min(1),
  name_en: z.string().optional(),
  name_ru: z.string().optional(),
  name_uz: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  symbol: z.string().optional(),
  sort_order: z.number().default(0),
  is_active: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
});

const DictionarySchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1),
  name: z.string().min(1),
  name_en: z.string().optional(),
  name_ru: z.string().optional(),
  name_uz: z.string().optional(),
  category: z.string().optional(),
  is_system: z.boolean().default(true),
  is_editable: z.boolean().default(false),
  sort_order: z.number().default(0),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
});

export const dictionariesRouter = router({
  // Get all dictionaries
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const result = await ctx.db.execute(
        'SELECT * FROM dictionaries WHERE status = ? ORDER BY sort_order, name',
        ['active']
      );
      return result[0];
    } catch (error) {
      throw new Error(`Failed to fetch dictionaries: ${error}`);
    }
  }),

  // Get dictionary by code
  getByCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const [result] = await ctx.db.execute(
          'SELECT * FROM dictionaries WHERE code = ?',
          [input.code]
        );
        return result[0] || null;
      } catch (error) {
        throw new Error(`Failed to fetch dictionary: ${error}`);
      }
    }),

  // Get dictionary items by dictionary code
  getItems: publicProcedure
    .input(z.object({ dictionaryCode: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const [dictResult] = await ctx.db.execute(
          'SELECT id FROM dictionaries WHERE code = ?',
          [input.dictionaryCode]
        );

        if (!dictResult[0]) {
          return [];
        }

        const [items] = await ctx.db.execute(
          `SELECT * FROM dictionary_items 
           WHERE dictionaryId = ? AND is_active = true 
           ORDER BY sort_order, name`,
          [dictResult[0].id]
        );

        return items;
      } catch (error) {
        throw new Error(`Failed to fetch dictionary items: ${error}`);
      }
    }),

  // Get dictionary items by ID
  getItemsById: publicProcedure
    .input(z.object({ dictionaryId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const [items] = await ctx.db.execute(
          `SELECT * FROM dictionary_items 
           WHERE dictionaryId = ? AND is_active = true 
           ORDER BY sort_order, name`,
          [input.dictionaryId]
        );
        return items;
      } catch (error) {
        throw new Error(`Failed to fetch dictionary items: ${error}`);
      }
    }),

  // Create dictionary item
  createItem: publicProcedure
    .input(DictionaryItemSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const [result] = await ctx.db.execute(
          `INSERT INTO dictionary_items 
           (dictionaryId, code, name, name_en, name_ru, name_uz, description, icon, color, symbol, sort_order, is_active, metadata)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            input.dictionaryId,
            input.code,
            input.name,
            input.name_en || null,
            input.name_ru || null,
            input.name_uz || null,
            input.description || null,
            input.icon || null,
            input.color || null,
            input.symbol || null,
            input.sort_order,
            input.is_active,
            input.metadata ? JSON.stringify(input.metadata) : null,
          ]
        );
        return { id: result.insertId, ...input };
      } catch (error) {
        throw new Error(`Failed to create dictionary item: ${error}`);
      }
    }),

  // Update dictionary item
  updateItem: publicProcedure
    .input(DictionaryItemSchema.extend({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.execute(
          `UPDATE dictionary_items 
           SET code = ?, name = ?, name_en = ?, name_ru = ?, name_uz = ?, 
               description = ?, icon = ?, color = ?, symbol = ?, sort_order = ?, 
               is_active = ?, metadata = ?, updatedAt = NOW()
           WHERE id = ?`,
          [
            input.code,
            input.name,
            input.name_en || null,
            input.name_ru || null,
            input.name_uz || null,
            input.description || null,
            input.icon || null,
            input.color || null,
            input.symbol || null,
            input.sort_order,
            input.is_active,
            input.metadata ? JSON.stringify(input.metadata) : null,
            input.id,
          ]
        );
        return input;
      } catch (error) {
        throw new Error(`Failed to update dictionary item: ${error}`);
      }
    }),

  // Delete dictionary item (soft delete)
  deleteItem: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.execute(
          'UPDATE dictionary_items SET is_active = false, updatedAt = NOW() WHERE id = ?',
          [input.id]
        );
        return { success: true };
      } catch (error) {
        throw new Error(`Failed to delete dictionary item: ${error}`);
      }
    }),

  // Bulk delete dictionary items
  bulkDeleteItems: publicProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const placeholders = input.ids.map(() => '?').join(',');
        await ctx.db.execute(
          `UPDATE dictionary_items SET is_active = false, updatedAt = NOW() 
           WHERE id IN (${placeholders})`,
          input.ids
        );
        return { success: true, count: input.ids.length };
      } catch (error) {
        throw new Error(`Failed to bulk delete dictionary items: ${error}`);
      }
    }),

  // Get dictionary by category
  getByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const [result] = await ctx.db.execute(
          'SELECT * FROM dictionaries WHERE category = ? AND status = ? ORDER BY sort_order',
          [input.category, 'active']
        );
        return result;
      } catch (error) {
        throw new Error(`Failed to fetch dictionaries by category: ${error}`);
      }
    }),

  // Search dictionary items
  search: publicProcedure
    .input(z.object({ 
      dictionaryCode: z.string(),
      query: z.string(),
      language: z.enum(['ru', 'en', 'uz']).default('ru'),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const [dictResult] = await ctx.db.execute(
          'SELECT id FROM dictionaries WHERE code = ?',
          [input.dictionaryCode]
        );

        if (!dictResult[0]) {
          return [];
        }

        const searchTerm = `%${input.query}%`;
        const nameField = input.language === 'en' ? 'name_en' : input.language === 'uz' ? 'name_uz' : 'name_ru';

        const [items] = await ctx.db.execute(
          `SELECT * FROM dictionary_items 
           WHERE dictionaryId = ? AND is_active = true 
           AND (name LIKE ? OR ${nameField} LIKE ? OR code LIKE ?)
           ORDER BY sort_order, name`,
          [dictResult[0].id, searchTerm, searchTerm, searchTerm]
        );

        return items;
      } catch (error) {
        throw new Error(`Failed to search dictionary items: ${error}`);
      }
    }),

  // Export dictionary to CSV
  export: publicProcedure
    .input(z.object({ dictionaryCode: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const [dictResult] = await ctx.db.execute(
          'SELECT * FROM dictionaries WHERE code = ?',
          [input.dictionaryCode]
        );

        if (!dictResult[0]) {
          throw new Error('Dictionary not found');
        }

        const [items] = await ctx.db.execute(
          `SELECT * FROM dictionary_items 
           WHERE dictionaryId = ? 
           ORDER BY sort_order, name`,
          [dictResult[0].id]
        );

        // Convert to CSV format
        const headers = ['code', 'name', 'name_en', 'name_ru', 'name_uz', 'icon', 'color', 'symbol', 'sort_order', 'is_active'];
        const csvRows = items.map((item: any) =>
          headers.map(h => {
            const value = item[h];
            if (value === null || value === undefined) return '';
            if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
            return value;
          }).join(',')
        );

        const csv = [headers.join(','), ...csvRows].join('\n');
        return { csv, filename: `${input.dictionaryCode}_${new Date().toISOString().split('T')[0]}.csv` };
      } catch (error) {
        throw new Error(`Failed to export dictionary: ${error}`);
      }
    }),
});

export type DictionariesRouter = typeof dictionariesRouter;
