/**
 * Dictionary Import Modal Component
 * 
 * Handles CSV file upload, validation, preview, and import
 * - File upload with drag-and-drop
 * - CSV parsing and validation
 * - Preview of data before import
 * - Error and warning display
 * - Bulk import execution
 */

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertCircle,
  CheckCircle2,
  Upload,
  Download,
  AlertTriangle,
  X,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { parseCSVFile, validateCSVData, downloadCSV, getCSVTemplate } from '@/lib/csvUtils';
import { trpc } from '@/lib/trpc';
import { undoRedoManager } from '@/lib/undoRedoManager';
import { RotateCcw, RotateCw } from 'lucide-react';

interface DictionaryImportModalProps {
  dictionaryCode: string;
  dictionaryName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type ImportStep = 'upload' | 'preview' | 'importing';

export function DictionaryImportModal({
  dictionaryCode,
  dictionaryName,
  isOpen,
  onClose,
  onSuccess,
}: DictionaryImportModalProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importMode, setImportMode] = useState<'create' | 'update' | 'upsert'>('upsert');
  const [skipErrors, setSkipErrors] = useState(false);
  const [importHistoryId, setImportHistoryId] = useState<number | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bulkImportMutation = trpc.dictionaryBulkOps.bulkImport.useMutation();
  const undoMutation = trpc.dictionaryBulkOps.undoImport.useMutation();
  const redoMutation = trpc.dictionaryBulkOps.redoImport.useMutation();

  // Subscribe to undo/redo state changes
  React.useEffect(() => {
    if (!importHistoryId) return;

    const unsubscribe = undoRedoManager.subscribe((id) => {
      if (id === importHistoryId) {
        const { canUndo, canRedo } = undoRedoManager.getCapabilities(id);
        setCanUndo(canUndo);
        setCanRedo(canRedo);
      }
    });

    return unsubscribe;
  }, [importHistoryId]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    toast.loading('Parsing CSV file...');

    try {
      const result = await parseCSVFile(selectedFile);
      setParseResult(result);

      if (result.errors.length > 0) {
        toast.error(`Found ${result.errors.length} parsing errors`);
      } else if (result.validCount > 0) {
        toast.success(`Parsed ${result.validCount} items successfully`);
        
        // Validate data
        const validation = validateCSVData(result.data);
        setValidationResult(validation);

        if (validation.valid) {
          setStep('preview');
        } else {
          toast.error(`Validation failed: ${validation.errors.length} errors found`);
        }
      }
    } catch (error) {
      toast.error('Failed to parse CSV file');
      console.error(error);
    }
  };

  const handleImport = async () => {
    if (!parseResult || parseResult.data.length === 0) {
      toast.error('No valid data to import');
      return;
    }

    setStep('importing');
    toast.loading('Importing data...');

    try {
      const result = await bulkImportMutation.mutateAsync({
        dictionaryCode,
        items: parseResult.data,
        mode: importMode,
        skipErrors,
      });

      if (result.success) {
        setImportHistoryId(result.importHistoryId);
        undoRedoManager.initializeStack(result.importHistoryId, {
          id: result.importHistoryId,
          dictionaryCode,
          fileName: file?.name || 'unknown',
          totalRecords: parseResult.data.length,
          successfulRecords: result.successfulRecords || 0,
          failedRecords: result.failedRecords || 0,
          status: 'completed',
          importMode,
          timestamp: new Date(),
        });
        toast.success(result.message);
        onSuccess?.();
        handleClose();
      } else {
        toast.error(result.error || 'Import failed');
      }
    } catch (error) {
      toast.error('Failed to import data');
      console.error(error);
    } finally {
      setStep('preview');
    }
  };

  const handleUndo = async () => {
    if (!importHistoryId || !canUndo) return;

    try {
      await undoMutation.mutateAsync({ importHistoryId });
      undoRedoManager.undo(importHistoryId);
      toast.success('Import undone');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to undo import');
      console.error(error);
    }
  };

  const handleRedo = async () => {
    if (!importHistoryId || !canRedo) return;

    try {
      await redoMutation.mutateAsync({ importHistoryId });
      undoRedoManager.redo(importHistoryId);
      toast.success('Import redone');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to redo import');
      console.error(error);
    }
  };

  const handleDownloadTemplate = () => {
    const { content, filename } = getCSVTemplate(dictionaryCode);
    downloadCSV(content, filename);
    toast.success('Template downloaded');
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setParseResult(null);
    setValidationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import {dictionaryName}</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import items into this dictionary
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Step */}
          {step === 'upload' && (
            <div className="space-y-4">
              {/* Drag and Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="font-semibold mb-1">Drag and drop your CSV file here</p>
                <p className="text-sm text-gray-600 mb-4">or click to select a file</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select CSV File
                </Button>
              </div>

              {/* File Info */}
              {file && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-sm">{file.name}</p>
                        <p className="text-xs text-gray-600">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFile(null);
                        setParseResult(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* Template Download */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">Need a template?</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </Button>
              </div>
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && parseResult && (
            <div className="space-y-4">
              {/* Parse Results Summary */}
              <Card className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Valid Items</p>
                    <p className="text-2xl font-bold text-green-600">
                      {parseResult.validCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Invalid Items</p>
                    <p className="text-2xl font-bold text-red-600">
                      {parseResult.invalidCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Rows</p>
                    <p className="text-2xl font-bold">
                      {parseResult.validCount + parseResult.invalidCount}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Errors */}
              {parseResult.errors.length > 0 && (
                <Card className="p-4 border-red-200 bg-red-50">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">
                        {parseResult.errors.length} Parsing Errors
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {parseResult.errors.slice(0, 5).map((error: string, i: number) => (
                      <p key={i} className="text-sm text-red-800">
                        {error}
                      </p>
                    ))}
                    {parseResult.errors.length > 5 && (
                      <p className="text-sm text-red-700 font-semibold">
                        +{parseResult.errors.length - 5} more errors
                      </p>
                    )}
                  </div>
                </Card>
              )}

              {/* Warnings */}
              {parseResult.warnings.length > 0 && (
                <Card className="p-4 border-yellow-200 bg-yellow-50">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900">
                        {parseResult.warnings.length} Warnings
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {parseResult.warnings.slice(0, 5).map((warning: string, i: number) => (
                      <p key={i} className="text-sm text-yellow-800">
                        {warning}
                      </p>
                    ))}
                  </div>
                </Card>
              )}

              {/* Preview Table */}
              {parseResult.data.length > 0 && (
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Preview (first 5 items)</p>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="px-4 py-2 text-left">Code</th>
                          <th className="px-4 py-2 text-left">Name</th>
                          <th className="px-4 py-2 text-left">Icon</th>
                          <th className="px-4 py-2 text-left">Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseResult.data.slice(0, 5).map((item: any, i: number) => (
                          <tr key={i} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2 font-mono text-xs">{item.code}</td>
                            <td className="px-4 py-2">{item.name}</td>
                            <td className="px-4 py-2">{item.icon || '-'}</td>
                            <td className="px-4 py-2">
                              {item.is_active !== false ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  Yes
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-50 text-gray-700">
                                  No
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parseResult.data.length > 5 && (
                    <p className="text-xs text-gray-600">
                      Showing 5 of {parseResult.data.length} items
                    </p>
                  )}
                </div>
              )}

              {/* Import Options */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-sm">Import Options</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value="upsert"
                      checked={importMode === 'upsert'}
                      onChange={(e) => setImportMode(e.target.value as any)}
                    />
                    <span className="text-sm">
                      <strong>Upsert</strong> - Create new, update existing
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value="create"
                      checked={importMode === 'create'}
                      onChange={(e) => setImportMode(e.target.value as any)}
                    />
                    <span className="text-sm">
                      <strong>Create</strong> - Only create new items
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value="update"
                      checked={importMode === 'update'}
                      onChange={(e) => setImportMode(e.target.value as any)}
                    />
                    <span className="text-sm">
                      <strong>Update</strong> - Only update existing items
                    </span>
                  </label>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-2 border-t">
                  <input
                    type="checkbox"
                    checked={skipErrors}
                    onChange={(e) => setSkipErrors(e.target.checked)}
                  />
                  <span className="text-sm">Skip errors and continue import</span>
                </label>
              </div>
            </div>
          )}

          {/* Importing Step */}
          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin mb-4">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full" />
              </div>
              <p className="font-semibold">Importing data...</p>
              <p className="text-sm text-gray-600 mt-1">
                Please wait while we process your file
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 'upload' && file && (
            <Button
              type="button"
              onClick={() => {
                if (parseResult && parseResult.validCount > 0) {
                  setStep('preview');
                }
              }}
              disabled={!parseResult || parseResult.validCount === 0}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          )}
          {step === 'preview' && (
            <Button
              type="button"
              onClick={handleImport}
              disabled={bulkImportMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {bulkImportMutation.isPending ? 'Importing...' : 'Import'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DictionaryImportModal;
