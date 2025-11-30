/**
 * ReferenceBookTable Component
 * 
 * Reusable table component for displaying reference books (справочники).
 * Supports sorting, filtering, pagination, and bulk actions.
 */

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit2, Trash2, MoreHorizontal, Search, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
}

export interface ReferenceBookTableProps {
  type: 'location' | 'category' | 'unit' | 'machineType' | 'componentType' | 'taskType' | 'supplierType';
  data: any[];
  columns: TableColumn[];
  isLoading?: boolean;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onBulkDelete?: (items: any[]) => Promise<void>;
  onExport?: () => void;
  showSearch?: boolean;
  showBulkActions?: boolean;
}

export function ReferenceBookTable({
  type,
  data,
  columns,
  isLoading = false,
  onEdit,
  onDelete,
  onBulkDelete,
  onExport,
  showSearch = true,
  showBulkActions = true,
}: ReferenceBookTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter data by search term
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;

    const aVal = a[sortColumn];
    const bVal = b[sortColumn];

    if (typeof aVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  // Handle sort
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Handle row selection
  const handleRowSelect = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === sortedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sortedData.map((_, i) => String(i))));
    }
  };

  // Handle delete
  const handleDelete = async (item: any) => {
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(item);
        toast.success('Элемент удален');
      }
    } catch (error) {
      toast.error('Ошибка при удалении');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    const itemsToDelete = sortedData.filter((_, i) => selectedRows.has(String(i)));
    
    setIsDeleting(true);
    try {
      if (onBulkDelete) {
        await onBulkDelete(itemsToDelete);
        toast.success(`Удалено ${itemsToDelete.length} элементов`);
        setSelectedRows(new Set());
      }
    } catch (error) {
      toast.error('Ошибка при удалении');
    } finally {
      setIsDeleting(false);
      setBulkDeleteConfirm(false);
    }
  };

  // Handle export
  const handleExport = () => {
    if (onExport) {
      onExport();
      toast.success('Данные экспортированы');
    }
  };

  // Get row ID
  const getRowId = (item: any, index: number) => {
    return item.id ? String(item.id) : String(index);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-lg">Нет данных для отображения</p>
        <p className="text-slate-500 text-sm mt-2">Попробуйте изменить фильтры или добавить новый элемент</p>
      </div>
    );
  }

  const selectedCount = selectedRows.size;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {showSearch && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Поиск..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600"
            />
          </div>
        )}

        <div className="flex gap-2">
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="border-white/10 text-white hover:bg-white/5"
            >
              <Download className="w-4 h-4 mr-2" />
              Экспорт
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && selectedCount > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-center justify-between">
          <span className="text-blue-400">Выбрано {selectedCount} элементов</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRows(new Set())}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Отменить выбор
            </Button>
            {onBulkDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteConfirm(true)}
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Удалить выбранные
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <ScrollArea className="rounded-lg border border-white/10">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-white/5">
              {showBulkActions && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedCount === sortedData.length && sortedData.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="border-white/20"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`text-slate-300 ${column.width || ''} ${
                    column.sortable ? 'cursor-pointer hover:text-white' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-right w-16">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => {
              const rowId = getRowId(item, index);
              const isSelected = selectedRows.has(rowId);

              return (
                <TableRow
                  key={rowId}
                  className={`border-white/10 hover:bg-white/5 transition-colors ${
                    isSelected ? 'bg-blue-500/10' : ''
                  }`}
                >
                  {showBulkActions && (
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleRowSelect(rowId)}
                        className="border-white/20"
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.key} className="text-slate-300">
                      {column.render
                        ? column.render(item[column.key], item)
                        : renderCellValue(item[column.key])}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-white"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                        {onEdit && (
                          <DropdownMenuItem
                            onClick={() => onEdit(item)}
                            className="text-slate-300 hover:text-white cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => setDeleteConfirm(item)}
                            className="text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-slate-900 border-white/10">
          <AlertDialogTitle className="text-white">Удалить элемент?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Это действие нельзя отменить. Элемент будет удален безвозвратно.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="border-white/10 text-white hover:bg-white/5">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteConfirm)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Удалить
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <AlertDialogContent className="bg-slate-900 border-white/10">
          <AlertDialogTitle className="text-white">
            Удалить {selectedCount} элементов?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Это действие нельзя отменить. Все выбранные элементы будут удалены безвозвратно.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="border-white/10 text-white hover:bg-white/5">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Удалить все
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Helper function to render cell values
function renderCellValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-slate-500">—</span>;
  }

  if (typeof value === 'boolean') {
    return (
      <Badge variant={value ? 'default' : 'outline'} className="bg-green-500/20 text-green-400">
        {value ? 'Да' : 'Нет'}
      </Badge>
    );
  }

  if (value instanceof Date) {
    return value.toLocaleDateString('ru-RU');
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

export default ReferenceBookTable;
