# Bulk Import/Export Functionality Guide

## Overview

Complete CSV-based bulk import and export system for all dictionaries with validation, preview, and error handling.

## Components

### 1. CSV Utilities (`client/src/lib/csvUtils.ts`)

**Functions:**
- `parseCSVFile(file: File)` - Parse and validate CSV file
- `generateCSV(items, options)` - Generate CSV from items
- `downloadCSV(content, filename)` - Download CSV file
- `generateTemplateCSV(code)` - Generate template
- `validateCSVData(data)` - Validate before import
- `getCSVTemplate(code)` - Get template for download

**Features:**
- ✅ Automatic header detection
- ✅ Data type validation
- ✅ Multilingual support
- ✅ Error and warning reporting
- ✅ CSV escaping and formatting

### 2. tRPC Endpoints (`server/routers/dictionaryBulkOps.ts`)

**Endpoints:**

#### `bulkImport`
```typescript
Input: {
  dictionaryCode: string;
  items: DictionaryItemCSV[];
  mode: 'create' | 'update' | 'upsert';
  skipErrors: boolean;
}

Output: {
  success: boolean;
  results: {
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
    warnings: Array<{ row: number; warning: string }>;
    createdItems: string[];
    updatedItems: string[];
  };
}
```

#### `bulkExport`
```typescript
Input: {
  dictionaryCode: string;
  format: 'full' | 'minimal';
  language: 'all' | 'ru' | 'en' | 'uz';
  includeInactive: boolean;
}

Output: {
  success: boolean;
  csv: string;
  itemCount: number;
  filename: string;
}
```

#### `validateImport`
```typescript
Input: {
  items: DictionaryItemCSV[];
}

Output: {
  valid: boolean;
  errors: string[];
  warnings: string[];
  itemCount: number;
}
```

#### `bulkDelete`
```typescript
Input: {
  dictionaryCode: string;
  itemCodes: string[];
  hardDelete: boolean;
}

Output: {
  success: boolean;
  deletedCount: number;
  message: string;
}
```

#### `getTemplate`
```typescript
Input: {
  dictionaryCode: string;
}

Output: {
  success: boolean;
  csv: string;
  headers: string[];
  filename: string;
}
```

### 3. Import Modal (`client/src/components/DictionaryImportModal.tsx`)

**Features:**
- ✅ Drag-and-drop file upload
- ✅ CSV parsing with error reporting
- ✅ Data preview (first 5 rows)
- ✅ Validation before import
- ✅ Import mode selection (create/update/upsert)
- ✅ Error handling and skip option
- ✅ Template download

**Usage:**
```typescript
import { DictionaryImportModal } from '@/components/DictionaryImportModal';

<DictionaryImportModal
  dictionaryCode="product_categories"
  dictionaryName="Product Categories"
  isOpen={isImportOpen}
  onClose={() => setIsImportOpen(false)}
  onSuccess={() => refreshItems()}
/>
```

### 4. Export Modal (`client/src/components/DictionaryExportModal.tsx`)

**Features:**
- ✅ Format selection (full/minimal)
- ✅ Language selection (RU/EN/UZ/All)
- ✅ Include/exclude inactive items
- ✅ CSV format preview
- ✅ Item count preview

**Usage:**
```typescript
import { DictionaryExportModal } from '@/components/DictionaryExportModal';

<DictionaryExportModal
  dictionaryCode="product_categories"
  dictionaryName="Product Categories"
  items={items}
  isOpen={isExportOpen}
  onClose={() => setIsExportOpen(false)}
/>
```

## CSV Format

### Full Format
```csv
"code","name","name_en","name_ru","name_uz","icon","color","symbol","sort_order","is_active","notes"
"beverages","Beverages","Beverages","Напитки","Ichimliklar","🥤","#FF0000","BEV",1,"true","Beverage products"
```

### Minimal Format
```csv
"code","name","name_en","name_ru","name_uz"
"beverages","Beverages","Beverages","Напитки","Ichimliklar"
```

## Validation Rules

### Required Fields
- `code` - Must be unique, alphanumeric with underscore/hyphen
- `name` - Required, max 255 characters

### Optional Fields
- `name_en`, `name_ru`, `name_uz` - Translations
- `icon` - Emoji or icon code
- `color` - Hex format (#RRGGBB)
- `symbol` - Short code, max 10 characters
- `sort_order` - Integer for sorting
- `is_active` - Boolean (true/false, 1/0, yes/no)
- `notes` - Max 500 characters

### Validation Errors
- Duplicate codes in batch
- Missing required fields
- Invalid code format
- Invalid color format
- Invalid sort_order type
- Invalid is_active value

## Integration Steps

### Step 1: Add to DictionaryItems Page

```typescript
import { DictionaryImportModal } from '@/components/DictionaryImportModal';
import { DictionaryExportModal } from '@/components/DictionaryExportModal';

export function DictionaryItems() {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <>
      {/* Import/Export Buttons */}
      <div className="flex gap-2">
        <Button onClick={() => setIsImportOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Import CSV
        </Button>
        <Button onClick={() => setIsExportOpen(true)}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Modals */}
      <DictionaryImportModal
        dictionaryCode={dictionaryCode}
        dictionaryName={dictionaryName}
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => refetchItems()}
      />

      <DictionaryExportModal
        dictionaryCode={dictionaryCode}
        dictionaryName={dictionaryName}
        items={items}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </>
  );
}
```

### Step 2: Add Router to Main tRPC

```typescript
// server/index.ts
import { dictionaryBulkOpsRouter } from './routers/dictionaryBulkOps';

export const appRouter = router({
  dictionaryBulkOps: dictionaryBulkOpsRouter,
  // ... other routers
});
```

## Usage Examples

### Import Workflow

1. User clicks "Import CSV" button
2. Modal opens with drag-and-drop area
3. User selects or drags CSV file
4. File is parsed and validated
5. Preview shows first 5 rows
6. User selects import mode (upsert recommended)
7. User clicks "Import"
8. Data is imported with error reporting
9. Success message and refresh

### Export Workflow

1. User clicks "Export CSV" button
2. Modal opens with format options
3. User selects:
   - Format (full/minimal)
   - Language (all/ru/en/uz)
   - Include inactive items (yes/no)
4. Preview shows export stats
5. User clicks "Export CSV"
6. CSV file is downloaded

## Error Handling

### Import Errors
- File not CSV format
- CSV parsing errors
- Validation errors (shown per row)
- Duplicate codes
- Invalid field values

### Error Recovery
- Skip errors option (continue with valid rows)
- Error details with row numbers
- Warnings for missing translations
- Detailed error messages

## Performance Considerations

### Large Files
- Streaming CSV parsing for large files
- Batch processing (1000 items per batch)
- Progress indication
- Memory-efficient processing

### Database
- Bulk insert operations
- Transaction support
- Rollback on error
- Audit logging

## Best Practices

### Before Import
1. Download template to understand format
2. Prepare data in Excel/Sheets
3. Validate translations
4. Check for duplicate codes
5. Test with small batch first

### During Import
1. Use upsert mode for safety
2. Enable skip errors for partial imports
3. Review error messages
4. Check preview before confirming

### After Import
1. Verify imported items
2. Check for missing data
3. Review audit logs
4. Update related modules if needed

## Troubleshooting

### "Invalid code format" Error
- Codes must be alphanumeric with underscore/hyphen
- No spaces or special characters
- Example: `product_category`, `item-001`

### "Duplicate code" Error
- Check for duplicate codes in CSV
- Check if code already exists in dictionary
- Use update mode if updating existing items

### "Missing required fields" Error
- Ensure `code` and `name` columns exist
- Check for empty cells in required columns
- Review CSV header row

### Export Shows No Items
- Check if items are marked as inactive
- Enable "Include Inactive Items" option
- Verify dictionary has items

## Future Enhancements

- [ ] Excel (.xlsx) support
- [ ] JSON import/export
- [ ] Scheduled bulk operations
- [ ] Bulk edit in spreadsheet view
- [ ] Undo/rollback functionality
- [ ] Bulk operation history
- [ ] Duplicate detection and merge
- [ ] Data transformation rules

---

**Last Updated:** November 30, 2025
**Status:** Complete ✅
**Version:** 1.0.0
