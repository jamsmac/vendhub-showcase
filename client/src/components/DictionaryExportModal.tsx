/**
 * Dictionary Export Modal Component
 * 
 * Handles CSV export with formatting options
 * - Export format selection (full, minimal)
 * - Language selection
 * - Include/exclude inactive items
 * - CSV generation and download
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { generateCSV, downloadCSV } from '@/lib/csvUtils';
import { trpc } from '@/lib/trpc';

interface DictionaryExportModalProps {
  dictionaryCode: string;
  dictionaryName: string;
  items: any[];
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'full' | 'minimal';
type ExportLanguage = 'all' | 'ru' | 'en' | 'uz';

export function DictionaryExportModal({
  dictionaryCode,
  dictionaryName,
  items,
  isOpen,
  onClose,
}: DictionaryExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('full');
  const [language, setLanguage] = useState<ExportLanguage>('all');
  const [includeInactive, setIncludeInactive] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const bulkExportMutation = trpc.dictionaryBulkOps.bulkExport.useMutation();

  const handleExport = async () => {
    if (items.length === 0) {
      toast.error('No items to export');
      return;
    }

    setIsExporting(true);
    toast.loading('Generating CSV...');

    try {
      // Generate CSV using local utility
      const csv = generateCSV(items, {
        format,
        language,
        includeInactive,
      });

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${dictionaryCode}_export_${timestamp}.csv`;

      downloadCSV(csv, filename);
      toast.success(`Exported ${items.length} items`);
      onClose();
    } catch (error) {
      toast.error('Failed to export data');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const getPreviewStats = () => {
    let count = items.length;
    if (!includeInactive) {
      count = items.filter((item) => item.is_active !== false).length;
    }
    return count;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export {dictionaryName}</DialogTitle>
          <DialogDescription>
            Download dictionary items as CSV file with custom formatting options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <div className="space-y-3">
            <p className="font-semibold text-sm">Export Format</p>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="format"
                  value="full"
                  checked={format === 'full'}
                  onChange={(e) => setFormat(e.target.value as ExportFormat)}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold text-sm">Full Format</p>
                  <p className="text-xs text-gray-600">
                    Includes all fields: code, names (all languages), icon, color, symbol,
                    sort order, active status, and notes
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="format"
                  value="minimal"
                  checked={format === 'minimal'}
                  onChange={(e) => setFormat(e.target.value as ExportFormat)}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold text-sm">Minimal Format</p>
                  <p className="text-xs text-gray-600">
                    Includes only essential fields: code and names (selected language)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-3">
            <p className="font-semibold text-sm">Language</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="language"
                  value="all"
                  checked={language === 'all'}
                  onChange={(e) => setLanguage(e.target.value as ExportLanguage)}
                />
                <span className="text-sm">All Languages</span>
              </label>
              <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="language"
                  value="ru"
                  checked={language === 'ru'}
                  onChange={(e) => setLanguage(e.target.value as ExportLanguage)}
                />
                <span className="text-sm">🇷🇺 Russian</span>
              </label>
              <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="language"
                  value="en"
                  checked={language === 'en'}
                  onChange={(e) => setLanguage(e.target.value as ExportLanguage)}
                />
                <span className="text-sm">🇬🇧 English</span>
              </label>
              <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="language"
                  value="uz"
                  checked={language === 'uz'}
                  onChange={(e) => setLanguage(e.target.value as ExportLanguage)}
                />
                <span className="text-sm">🇺🇿 Uzbek</span>
              </label>
            </div>
          </div>

          {/* Include Inactive Items */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
              />
              <div>
                <p className="font-semibold text-sm">Include Inactive Items</p>
                <p className="text-xs text-gray-600">
                  Export items marked as inactive
                </p>
              </div>
            </label>
          </div>

          {/* Preview */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-blue-900">Export Preview</p>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>{getPreviewStats()}</strong> items will be exported in{' '}
                  <strong>{format === 'full' ? 'full' : 'minimal'}</strong> format with{' '}
                  <strong>
                    {language === 'all' ? 'all languages' : `${language.toUpperCase()} language`}
                  </strong>
                </p>
              </div>
            </div>
          </Card>

          {/* Format Example */}
          <div className="space-y-2">
            <p className="font-semibold text-sm">CSV Format Example</p>
            <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
              <p className="text-gray-700">
                {format === 'full'
                  ? 'code,name,name_en,name_ru,name_uz,icon,color,symbol,sort_order,is_active,notes'
                  : language === 'all'
                    ? 'code,name,name_en,name_ru,name_uz'
                    : `code,name,name_${language}`}
              </p>
              <p className="text-gray-700 mt-1">
                {format === 'full'
                  ? '"example","Example","Example","Пример","Misol","📦","#FF0000","EX",1,"true","Notes"'
                  : language === 'all'
                    ? '"example","Example","Example","Пример","Misol"'
                    : `"example","Example"`}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={isExporting || items.length === 0}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DictionaryExportModal;
