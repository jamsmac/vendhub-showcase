/**
 * DragDropTable Component
 * Provides drag-and-drop reordering functionality for table rows
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GripVertical, Check } from 'lucide-react';

interface DragDropTableProps<T extends { id: number }> {
  items: T[];
  columns: {
    key: keyof T;
    label: string;
    render?: (value: any, item: T) => React.ReactNode;
  }[];
  onReorder: (items: T[]) => void;
  onEdit?: (item: T) => void;
  onDelete?: (id: number) => void;
  actions?: (item: T) => React.ReactNode;
  draggable?: boolean;
  selectable?: boolean;
  selectedIds?: number[];
  onSelectionChange?: (ids: number[]) => void;
}

export function DragDropTable<T extends { id: number }>({
  items,
  columns,
  onReorder,
  onEdit,
  onDelete,
  actions,
  draggable = true,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
}: DragDropTableProps<T>) {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);
  const [history, setHistory] = useState<T[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleSelectAll = useCallback(() => {
    if (onSelectionChange) {
      if (selectedIds.length === items.length) {
        onSelectionChange([]);
      } else {
        onSelectionChange(items.map((item) => item.id));
      }
    }
  }, [selectedIds, items, onSelectionChange]);

  const handleSelectItem = useCallback(
    (id: number) => {
      if (!onSelectionChange) return;
      const newSelection = selectedIds.includes(id)
        ? selectedIds.filter((sid) => sid !== id)
        : [...selectedIds, id];
      onSelectionChange(newSelection);
    },
    [selectedIds, onSelectionChange]
  );

  const handleDragStart = useCallback((id: number) => {
    setDraggedItem(id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: number) => {
    e.preventDefault();
    setDragOverItem(id);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverItem(null);
  }, []);

  const pushToHistory = useCallback((items: T[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push([...items]);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      onReorder([...history[prevIndex]]);
    }
  }, [historyIndex, history, onReorder]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      onReorder([...history[nextIndex]]);
    }
  }, [historyIndex, history, onReorder]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: number) => {
      e.preventDefault();
      setDragOverItem(null);

      if (draggedItem === null || draggedItem === targetId) {
        setDraggedItem(null);
        return;
      }

      const draggedIndex = items.findIndex((item) => item.id === draggedItem);
      const targetIndex = items.findIndex((item) => item.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedItem(null);
        return;
      }

      // Create new array with reordered items
      const newItems = [...items];
      const [draggedItemObj] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, draggedItemObj);

      // Update sort_order based on new positions
      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        sort_order: index,
      }));

      pushToHistory(reorderedItems);
      onReorder(reorderedItems);
      setDraggedItem(null);
    },
    [draggedItem, items, onReorder]
  );

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            {selectable && (
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.length === items.length && items.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-white/20 cursor-pointer"
                />
              </TableHead>
            )}
            {draggable && <TableHead className="w-10" />}
            {columns.map((column) => (
              <TableHead key={String(column.key)} className="text-slate-300">
                {column.label}
              </TableHead>
            ))}
            {actions && <TableHead className="w-20 text-right">Действия</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              draggable={draggable}
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item.id)}
              className={`border-white/10 transition-colors ${
                draggedItem === item.id ? 'opacity-50 bg-blue-500/10' : ''
              } ${
                dragOverItem === item.id ? 'bg-blue-500/20' : selectedIds.includes(item.id) ? 'bg-blue-500/10' : 'hover:bg-white/5'
              } ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
            >
              {selectable && (
                <TableCell className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="rounded border-white/20 cursor-pointer"
                  />
                </TableCell>
              )}
              {draggable && (
                <TableCell className="text-slate-500 p-2">
                  <GripVertical className="w-4 h-4" />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={String(column.key)} className="text-slate-300">
                  {column.render
                    ? column.render(item[column.key], item)
                    : String(item[column.key])}
                </TableCell>
              ))}
              {actions && <TableCell className="text-right">{actions(item)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
