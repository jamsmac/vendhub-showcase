/**
 * DragDropTable Component
 * Provides drag-and-drop reordering functionality for table rows
 */

import { useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GripVertical } from 'lucide-react';

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
}

export function DragDropTable<T extends { id: number }>({
  items,
  columns,
  onReorder,
  onEdit,
  onDelete,
  actions,
  draggable = true,
}: DragDropTableProps<T>) {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);

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
                dragOverItem === item.id ? 'bg-blue-500/20' : 'hover:bg-white/5'
              } ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
            >
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
