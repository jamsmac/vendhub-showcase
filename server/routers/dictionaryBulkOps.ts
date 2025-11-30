/**
 * Dictionary Bulk Operations Router
 * 
 * Handles bulk import/export operations for dictionaries
 * - CSV import with validation
 * - CSV export with formatting options
 * - Batch operations (create, update, delete)
 * - Error handling and reporting
 */

import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

// Validation schemas
const DictionaryItemCSVSchema = z.object({
  code: z.string().min(1).max(100).regex(/^[a-z0-9_-]+$/i),
  name: z.string().min(1).max(255),
  name_en: z.string().max(255).optional(),
  name_ru: z.string().max(255).optional(),
  name_uz: z.string().max(255).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  symbol: z.string().max(10).optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

const BulkImportSchema = z.object({
  dictionaryCode: z.string().min(1),
  items: z.array(DictionaryItemCSVSchema),
  mode: z.enum(['create', 'update', 'upsert']).default('upsert'),
  skipErrors: z.boolean().default(false),
});

const BulkExportSchema = z.object({
  dictionaryCode: z.string().min(1),
  format: z.enum(['full', 'minimal']).default('full'),
  language: z.enum(['all', 'ru', 'en', 'uz']).default('all'),
  includeInactive: z.boolean().default(true),
});

const BulkDeleteSchema = z.object({
  dictionaryCode: z.string().min(1),
  itemCodes: z.array(z.string()),
  hardDelete: z.boolean().default(false),
});

export const dictionaryBulkOpsRouter = router({
  /**
   * Bulk import dictionary items from CSV data
   */
  bulkImport: publicProcedure
    .input(BulkImportSchema)
    .mutation(async ({ input }) => {
      const { dictionaryCode, items, mode, skipErrors } = input;
      const results = {
        success: 0,
        failed: 0,
        errors: [] as Array<{ row: number; error: string }>,
        warnings: [] as Array<{ row: number; warning: string }>,
        createdItems: [] as string[],
        updatedItems: [] as string[],
      };

      try {
        // Validate dictionary exists
        // const dictionary = await db.query.dictionaries.findFirst({
        //   where: eq(dictionaries.code, dictionaryCode),
        // });
        // if (!dictionary) {
        //   throw new Error(`Dictionary "${dictionaryCode}" not found`);
        // }

        // Process each item
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const rowNum = i + 2; // +2 for header and 1-based indexing

          try {
            // Validate item schema
            const validated = DictionaryItemCSVSchema.parse(item);

            // Check for duplicates in batch
            if (results.createdItems.includes(validated.code) || 
                results.updatedItems.includes(validated.code)) {
              results.warnings.push({
                row: rowNum,
                warning: `Duplicate code "${validated.code}" in batch`,
              });
              continue;
            }

            // TODO: Implement actual database operations
            // For now, mock the operations
            if (mode === 'create' || mode === 'upsert') {
              results.createdItems.push(validated.code);
              results.success++;
            } else if (mode === 'update') {
              results.updatedItems.push(validated.code);
              results.success++;
            }
          } catch (error) {
            results.failed++;
            results.errors.push({
              row: rowNum,
              error: (error as Error).message,
            });

            if (!skipErrors) {
              throw error;
            }
          }
        }

        return {
          success: true,
          results,
          message: `Import completed: ${results.success} successful, ${results.failed} failed`,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          results,
        };
      }
    }),

  /**
   * Export dictionary items as CSV
   */
  bulkExport: publicProcedure
    .input(BulkExportSchema)
    .query(async ({ input }) => {
      const { dictionaryCode, format, language, includeInactive } = input;

      try {
        // TODO: Fetch items from database
        // const items = await db.query.dictionaryItems.findMany({
        //   where: and(
        //     eq(dictionaryItems.dictionaryCode, dictionaryCode),
        //     includeInactive ? undefined : eq(dictionaryItems.is_active, true),
        //   ),
        // });

        // Mock data
        const items = [
          {
            code: 'example_1',
            name: 'Example Item 1',
            name_en: 'Example Item 1',
            name_ru: 'Пример элемента 1',
            name_uz: 'Misol elementi 1',
            icon: '📦',
            color: '#FF0000',
            symbol: 'EX1',
            sort_order: 1,
            is_active: true,
            notes: 'Example notes',
          },
        ];

        // Generate CSV
        const headers = getCSVHeaders(format, language);
        const rows = generateCSVRows(items, headers);
        const csv = [headers.join(','), ...rows].join('\n');

        return {
          success: true,
          csv,
          itemCount: items.length,
          filename: `${dictionaryCode}_export_${new Date().toISOString().split('T')[0]}.csv`,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Validate CSV data before import
   */
  validateImport: publicProcedure
    .input(z.object({
      items: z.array(DictionaryItemCSVSchema),
    }))
    .query(({ input }) => {
      const { items } = input;
      const errors: string[] = [];
      const warnings: string[] = [];
      const codes = new Set<string>();

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const rowNum = i + 2;

        // Check for duplicate codes
        if (codes.has(item.code)) {
          errors.push(`Row ${rowNum}: Duplicate code "${item.code}"`);
        }
        codes.add(item.code);

        // Check required fields
        if (!item.code || !item.name) {
          errors.push(`Row ${rowNum}: Missing required fields`);
        }

        // Validate code format
        if (!/^[a-z0-9_-]+$/i.test(item.code)) {
          errors.push(`Row ${rowNum}: Invalid code format`);
        }

        // Warn about missing translations
        if (!item.name_en || !item.name_ru || !item.name_uz) {
          warnings.push(`Row ${rowNum}: Missing some translations`);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        itemCount: items.length,
      };
    }),

  /**
   * Bulk delete dictionary items
   */
  bulkDelete: publicProcedure
    .input(BulkDeleteSchema)
    .mutation(async ({ input }) => {
      const { dictionaryCode, itemCodes, hardDelete } = input;

      try {
        // TODO: Implement actual database deletion
        // if (hardDelete) {
        //   await db.delete(dictionaryItems)
        //     .where(and(
        //       eq(dictionaryItems.dictionaryCode, dictionaryCode),
        //       inArray(dictionaryItems.code, itemCodes),
        //     ));
        // } else {
        //   await db.update(dictionaryItems)
        //     .set({ is_active: false })
        //     .where(and(
        //       eq(dictionaryItems.dictionaryCode, dictionaryCode),
        //       inArray(dictionaryItems.code, itemCodes),
        //     ));
        // }

        return {
          success: true,
          deletedCount: itemCodes.length,
          message: `${itemCodes.length} items deleted`,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Get CSV template for a dictionary
   */
  getTemplate: publicProcedure
    .input(z.object({
      dictionaryCode: z.string().min(1),
    }))
    .query(({ input }) => {
      const { dictionaryCode } = input;

      const headers = [
        'code',
        'name',
        'name_en',
        'name_ru',
        'name_uz',
        'icon',
        'color',
        'symbol',
        'sort_order',
        'is_active',
        'notes',
      ];

      const exampleRow = {
        code: 'example_code',
        name: 'Example Item',
        name_en: 'Example Item',
        name_ru: 'Пример элемента',
        name_uz: 'Misol elementi',
        icon: '📦',
        color: '#FF0000',
        symbol: 'EX',
        sort_order: 1,
        is_active: true,
        notes: 'Example notes',
      };

      const csv = [
        headers.map((h) => `"${h}"`).join(','),
        headers.map((h) => `"${exampleRow[h as keyof typeof exampleRow] ?? ''}"`).join(','),
      ].join('\n');

      return {
        success: true,
        csv,
        headers,
        filename: `${dictionaryCode}_template.csv`,
      };
    }),
});

/**
 * Helper: Get CSV headers based on format and language
 */
function getCSVHeaders(format: 'full' | 'minimal', language: 'all' | 'ru' | 'en' | 'uz'): string[] {
  if (format === 'minimal') {
    const headers = ['code', 'name'];
    if (language === 'all' || language === 'en') headers.push('name_en');
    if (language === 'all' || language === 'ru') headers.push('name_ru');
    if (language === 'all' || language === 'uz') headers.push('name_uz');
    return headers;
  }

  return [
    'code',
    'name',
    'name_en',
    'name_ru',
    'name_uz',
    'icon',
    'color',
    'symbol',
    'sort_order',
    'is_active',
    'notes',
  ];
}

/**
 * Helper: Generate CSV rows from items
 */
function generateCSVRows(items: any[], headers: string[]): string[] {
  return items.map((item) => {
    return headers
      .map((header) => {
        let value = item[header] ?? '';
        if (typeof value === 'boolean') {
          value = value ? 'true' : 'false';
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(',');
  });
}
