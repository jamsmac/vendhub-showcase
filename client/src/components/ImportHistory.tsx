/**
 * Import History Component
 * 
 * Displays history of bulk import operations with:
 * - Status tracking (pending, completed, failed, rolled_back)
 * - Rollback capability for completed imports
 * - Error details and recovery options
 * - Batch transaction details
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  ChevronDown,
  Trash2,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { formatDistanceToNow } from 'date-fns';

interface ImportHistoryProps {
  dictionaryCode: string;
}

interface ImportRecord {
  id: number;
  dictionaryCode: string;
  fileName: string;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  importMode: 'create' | 'update' | 'upsert';
  performedBy: number;
  errorLog?: string;
  rolledBackAt?: string;
  rolledBackBy?: number;
  createdAt: string;
  updatedAt: string;
}

export function ImportHistory({ dictionaryCode }: ImportHistoryProps) {
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedImport, setSelectedImport] = useState<ImportRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: importHistory } = trpc.dictionaryBulkOps.getImportHistory.useQuery(
    { dictionaryCode },
    { enabled: !!dictionaryCode }
  );

  const rollbackMutation = trpc.dictionaryBulkOps.rollbackImport.useMutation();
  const deleteHistoryMutation = trpc.dictionaryBulkOps.deleteImportHistory.useMutation();

  useEffect(() => {
    if (importHistory) {
      setImports(importHistory);
    }
  }, [importHistory]);

  const handleRollback = async (importId: number) => {
    if (!confirm('Are you sure you want to rollback this import? This action cannot be undone.')) {
      return;
    }

    try {
      await rollbackMutation.mutateAsync({ importId });
      toast.success('Import rolled back successfully');
      // Refresh history
      const updated = imports.map((imp) =>
        imp.id === importId ? { ...imp, status: 'rolled_back' as const } : imp
      );
      setImports(updated);
    } catch (error) {
      toast.error('Failed to rollback import');
      console.error(error);
    }
  };

  const handleDeleteHistory = async (importId: number) => {
    if (!confirm('Are you sure you want to delete this import history?')) {
      return;
    }

    try {
      await deleteHistoryMutation.mutateAsync({ importId });
      toast.success('Import history deleted');
      setImports(imports.filter((imp) => imp.id !== importId));
    } catch (error) {
      toast.error('Failed to delete import history');
      console.error(error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'rolled_back':
        return <RotateCcw className="w-4 h-4 text-yellow-500" />;
      case 'in_progress':
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      failed: 'destructive',
      rolled_back: 'secondary',
      in_progress: 'outline',
      pending: 'outline',
    };

    const labels: Record<string, string> = {
      completed: 'Completed',
      failed: 'Failed',
      rolled_back: 'Rolled Back',
      in_progress: 'In Progress',
      pending: 'Pending',
    };

    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  if (imports.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No import history yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Import History</h3>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Records</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imports.map((imp) => (
              <React.Fragment key={imp.id}>
                <TableRow className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-medium">{imp.fileName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {imp.importMode}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="text-green-600 font-medium">{imp.successfulRecords}</span>
                      <span className="text-gray-500"> / {imp.totalRecords}</span>
                      {imp.failedRecords > 0 && (
                        <span className="text-red-600 ml-2">({imp.failedRecords} failed)</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(imp.status)}
                      {getStatusBadge(imp.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(imp.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedImport(imp);
                          setIsDetailsOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {imp.status === 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRollback(imp.id)}
                          disabled={rollbackMutation.isPending}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHistory(imp.id)}
                        disabled={deleteHistoryMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {expandedId === imp.id && imp.errorLog && (
                  <TableRow className="bg-red-50">
                    <TableCell colSpan={6}>
                      <div className="p-4 bg-red-100 rounded text-sm text-red-800">
                        <p className="font-semibold mb-2">Error Log:</p>
                        <pre className="whitespace-pre-wrap break-words">{imp.errorLog}</pre>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Details</DialogTitle>
            <DialogDescription>
              {selectedImport?.fileName} - {selectedImport?.createdAt}
            </DialogDescription>
          </DialogHeader>

          {selectedImport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Import Mode</p>
                  <p className="font-semibold capitalize">{selectedImport.importMode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedImport.status)}
                    {getStatusBadge(selectedImport.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="font-semibold">{selectedImport.totalRecords}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Successful</p>
                  <p className="font-semibold text-green-600">{selectedImport.successfulRecords}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="font-semibold text-red-600">{selectedImport.failedRecords}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="font-semibold">
                    {selectedImport.totalRecords > 0
                      ? ((selectedImport.successfulRecords / selectedImport.totalRecords) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              </div>

              {selectedImport.errorLog && (
                <div className="bg-red-50 p-4 rounded">
                  <p className="text-sm font-semibold text-red-800 mb-2">Error Log</p>
                  <pre className="text-xs text-red-700 whitespace-pre-wrap break-words">
                    {selectedImport.errorLog}
                  </pre>
                </div>
              )}

              {selectedImport.status === 'rolled_back' && selectedImport.rolledBackAt && (
                <div className="bg-yellow-50 p-4 rounded">
                  <p className="text-sm font-semibold text-yellow-800">
                    Rolled back on {new Date(selectedImport.rolledBackAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
