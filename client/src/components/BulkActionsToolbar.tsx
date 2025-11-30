/**
 * BulkActionsToolbar Component
 * Provides bulk action controls for selected items
 */

import { Button } from '@/components/ui/button';
import { Trash2, Toggle2, Download, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onDelete: () => void;
  onToggleStatus: () => void;
  onExport: () => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function BulkActionsToolbar({
  selectedCount,
  onDelete,
  onToggleStatus,
  onExport,
  onClear,
  isLoading = false,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-white/10 backdrop-blur-sm z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">
            Выбрано: <span className="font-semibold text-white">{selectedCount}</span> элементов
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleStatus}
            disabled={isLoading}
            className="text-slate-300 border-white/20 hover:bg-white/10"
          >
            <Toggle2 className="w-4 h-4 mr-2" />
            Переключить статус
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={isLoading}
            className="text-slate-300 border-white/20 hover:bg-white/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Экспортировать
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isLoading}
            className="bg-red-600/20 text-red-400 border-red-500/30 hover:bg-red-600/30"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Удалить
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-300 hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
