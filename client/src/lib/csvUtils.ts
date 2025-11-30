/**
 * CSV Utilities for Dictionary Import/Export
 * 
 * Provides functions for:
 * - Parsing CSV files
 * - Validating CSV data
 * - Generating CSV exports
 * - Handling multilingual data
 */

import Papa from 'papaparse';

export interface DictionaryItemCSV {
  code: string;
  name: string;
  name_en?: string;
  name_ru?: string;
  name_uz?: string;
  icon?: string;
  color?: string;
  symbol?: string;
  sort_order?: number;
  is_active?: boolean;
  notes?: string;
}

export interface CSVParseResult {
  data: DictionaryItemCSV[];
  errors: string[];
  warnings: string[];
  validCount: number;
  invalidCount: number;
}

export interface CSVExportOptions {
  includeInactive?: boolean;
  includeMetadata?: boolean;
  format?: 'full' | 'minimal';
  language?: 'all' | 'ru' | 'en' | 'uz';
}

/**
 * Parse CSV file and validate structure
 */
export async function parseCSVFile(file: File): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const data: DictionaryItemCSV[] = [];
    let validCount = 0;
    let invalidCount = 0;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (h) => h.toLowerCase().trim(),
      step: (row, parser) => {
        try {
          const item = validateCSVRow(row.data);
          if (item.valid) {
            data.push(item.data);
            validCount++;
          } else {
            invalidCount++;
            errors.push(`Row ${data.length + invalidCount}: ${item.error}`);
          }
        } catch (error) {
          invalidCount++;
          errors.push(`Row ${data.length + invalidCount}: ${(error as Error).message}`);
        }
      },
      complete: () => {
        resolve({
          data,
          errors,
          warnings,
          validCount,
          invalidCount,
        });
      },
      error: (error) => {
        errors.push(`CSV Parse Error: ${error.message}`);
        resolve({
          data: [],
          errors,
          warnings,
          validCount: 0,
          invalidCount: 0,
        });
      },
    });
  });
}

/**
 * Validate a single CSV row
 */
function validateCSVRow(row: any): { valid: boolean; data?: DictionaryItemCSV; error?: string } {
  // Check required fields
  if (!row.code || typeof row.code !== 'string') {
    return { valid: false, error: 'Missing or invalid code field' };
  }

  if (!row.name || typeof row.name !== 'string') {
    return { valid: false, error: 'Missing or invalid name field' };
  }

  // Validate code format (alphanumeric, underscore, hyphen)
  if (!/^[a-z0-9_-]+$/i.test(row.code)) {
    return { valid: false, error: `Invalid code format: "${row.code}". Use only alphanumeric, underscore, and hyphen.` };
  }

  // Validate sort_order if provided
  let sortOrder: number | undefined;
  if (row.sort_order) {
    const parsed = parseInt(row.sort_order, 10);
    if (isNaN(parsed)) {
      return { valid: false, error: `Invalid sort_order: "${row.sort_order}". Must be a number.` };
    }
    sortOrder = parsed;
  }

  // Validate is_active if provided
  let isActive = true;
  if (row.is_active !== undefined && row.is_active !== '') {
    const val = String(row.is_active).toLowerCase();
    if (val === 'false' || val === '0' || val === 'no') {
      isActive = false;
    } else if (val !== 'true' && val !== '1' && val !== 'yes') {
      return { valid: false, error: `Invalid is_active: "${row.is_active}". Use true/false, 1/0, or yes/no.` };
    }
  }

  // Validate color if provided
  if (row.color && !/^#[0-9A-F]{6}$/i.test(row.color)) {
    return { valid: false, error: `Invalid color format: "${row.color}". Use hex format like #FF0000.` };
  }

  const item: DictionaryItemCSV = {
    code: row.code.trim().toLowerCase(),
    name: row.name.trim(),
    name_en: row.name_en ? row.name_en.trim() : undefined,
    name_ru: row.name_ru ? row.name_ru.trim() : undefined,
    name_uz: row.name_uz ? row.name_uz.trim() : undefined,
    icon: row.icon ? row.icon.trim() : undefined,
    color: row.color ? row.color.trim() : undefined,
    symbol: row.symbol ? row.symbol.trim() : undefined,
    sort_order: sortOrder,
    is_active: isActive,
    notes: row.notes ? row.notes.trim() : undefined,
  };

  return { valid: true, data: item };
}

/**
 * Generate CSV content from dictionary items
 */
export function generateCSV(
  items: any[],
  options: CSVExportOptions = {}
): string {
  const {
    includeInactive = true,
    includeMetadata = true,
    format = 'full',
    language = 'all',
  } = options;

  // Filter items
  let filtered = items;
  if (!includeInactive) {
    filtered = items.filter((item) => item.is_active !== false);
  }

  // Define headers based on format
  let headers: string[];
  if (format === 'minimal') {
    headers = ['code', 'name'];
    if (language === 'all' || language === 'en') headers.push('name_en');
    if (language === 'all' || language === 'ru') headers.push('name_ru');
    if (language === 'all' || language === 'uz') headers.push('name_uz');
  } else {
    headers = [
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

  // Build CSV rows
  const rows: string[] = [];
  rows.push(headers.map((h) => `"${h}"`).join(','));

  for (const item of filtered) {
    const values = headers.map((header) => {
      let value = item[header] ?? '';
      if (typeof value === 'boolean') {
        value = value ? 'true' : 'false';
      }
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    rows.push(values.join(','));
  }

  return rows.join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate template CSV for a dictionary
 */
export function generateTemplateCSV(dictionaryCode: string): string {
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

  const rows: string[] = [];
  rows.push(headers.map((h) => `"${h}"`).join(','));

  // Add example row
  const example = [
    '"example_code"',
    '"Example Item"',
    '"Example Item"',
    '"Пример элемента"',
    '"Misol elementi"',
    '"📦"',
    '"#FF0000"',
    '"EX"',
    '"1"',
    '"true"',
    '"Example notes"',
  ];
  rows.push(example.join(','));

  return rows.join('\n');
}

/**
 * Validate CSV data before import
 */
export function validateCSVData(data: DictionaryItemCSV[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const codes = new Set<string>();

  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    // Check for duplicate codes
    if (codes.has(item.code)) {
      errors.push(`Row ${i + 2}: Duplicate code "${item.code}"`);
    }
    codes.add(item.code);

    // Check required fields
    if (!item.code || !item.name) {
      errors.push(`Row ${i + 2}: Missing required fields (code, name)`);
    }

    // Check code format
    if (!/^[a-z0-9_-]+$/i.test(item.code)) {
      errors.push(`Row ${i + 2}: Invalid code format "${item.code}"`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get CSV template for download
 */
export function getCSVTemplate(dictionaryCode: string): { content: string; filename: string } {
  const content = generateTemplateCSV(dictionaryCode);
  const filename = `${dictionaryCode}_template.csv`;
  return { content, filename };
}
