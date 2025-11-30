/**
 * Dictionary Items Page - View and Edit Dictionary Elements
 * 
 * Displays all items for a specific dictionary with:
 * - Searchable table
 * - Add/Edit/Delete operations
 * - Bulk actions
 * - Multilingual support (RU, EN, UZ)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, Edit2, Trash2, MoreHorizontal, ArrowLeft, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { DictionaryImportModal } from '@/components/DictionaryImportModal';
import { DragDropTable } from '@/components/DragDropTable';
import { BulkActionsToolbar } from '@/components/BulkActionsToolbar';
import { DictionaryExportModal } from '@/components/DictionaryExportModal';
import { ImportHistory } from '@/components/ImportHistory';

interface DictionaryItem {
  id: number;
  code: string;
  name: string;
  name_en?: string;
  name_ru?: string;
  name_uz?: string;
  icon?: string;
  color?: string;
  symbol?: string;
  sort_order: number;
  is_active: boolean;
}

export function DictionaryItems() {
  const [router] = useRouter();
  const { code } = useParams<{ code: string }>();
  
  const [items, setItems] = useState<DictionaryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DictionaryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [allItems, setAllItems] = useState<DictionaryItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data: itemsData, isLoading: isLoadingItems, refetch } = trpc.dictionaryItems.getItems.useQuery(
    { dictionaryCode: code || '', activeOnly: false, limit: 50, cursor: undefined },
    { enabled: !!code }
  );

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const moreData = await trpc.dictionaryItems.getItems.query({
        dictionaryCode: code || '',
        activeOnly: false,
        limit: 50,
        cursor: nextCursor
      });
      setAllItems(prev => [...prev, ...moreData.items]);
      setNextCursor(moreData.nextCursor);
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore, code]);

  useEffect(() => {
    if (itemsData) {
      setAllItems(itemsData.items);
      setNextCursor(itemsData.nextCursor);
      setItems(itemsData.items);
    }
    setIsLoading(isLoadingItems);
  }, [itemsData, isLoadingItems]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && nextCursor && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [nextCursor, isLoadingMore, loadMore]);

  // Use search endpoint when search term is present
  const { data: searchResults } = trpc.dictionaryItems.search.useQuery(
    { dictionaryCode: code || '', searchTerm, activeOnly: false, limit: 50 },
    { enabled: !!code && searchTerm.length > 0 }
  );

  const filteredItems = searchTerm.length > 0 ? (searchResults?.items || []) : allItems;

  const handleAddItem = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: DictionaryItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const createMutation = trpc.dictionaryItems.create.useMutation({
    onSuccess: () => {
      toast.success('Элемент добавлен');
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Ошибка при добавлении');
    },
  });

  const updateMutation = trpc.dictionaryItems.update.useMutation({
    onSuccess: () => {
      toast.success('Элемент обновлен');
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Ошибка при обновлении');
    },
  });

  const handleSaveItem = async (item: DictionaryItem) => {
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: item.id,
          code: item.code,
          name: item.name,
          name_en: item.name_en,
          name_ru: item.name_ru,
          name_uz: item.name_uz,
          icon: item.icon,
          color: item.color,
          symbol: item.symbol,
          sort_order: item.sort_order,
          is_active: item.is_active,
        });
      } else {
        await createMutation.mutateAsync({
          dictionaryCode: code || '',
          code: item.code,
          name: item.name,
          name_en: item.name_en,
          name_ru: item.name_ru,
          name_uz: item.name_uz,
          icon: item.icon,
          color: item.color,
          symbol: item.symbol,
          sort_order: item.sort_order,
          is_active: item.is_active,
        });
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const deleteMutation = trpc.dictionaryItems.delete.useMutation({
    onSuccess: () => {
      toast.success('Элемент удален');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Ошибка при удалении');
    },
  });

  const reorderMutation = trpc.dictionaryItems.reorder.useMutation({
    onSuccess: () => {
      toast.success('Порядок элементов обновлен');
    },
    onError: (error) => {
      toast.error(error.message || 'Ошибка при переупорядочении');
    },
  });

  const bulkDeleteMutation = trpc.dictionaryItems.bulkDelete.useMutation({
    onSuccess: () => {
      toast.success('Элементы удалены');
      setSelectedIds([]);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Ошибка при удалении');
    },
  });

  const bulkToggleMutation = trpc.dictionaryItems.bulkToggleStatus.useMutation({
    onSuccess: () => {
      toast.success('Статус обновлен');
      setSelectedIds([]);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Ошибка при обновлении статуса');
    },
  });

  const bulkExportMutation = trpc.dictionaryItems.bulkExport.useQuery(
    { ids: selectedIds, format: 'json', language: 'en' },
    { enabled: false }
  );

  const handleDeleteItem = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleReorder = async (reorderedItems: DictionaryItem[]) => {
    try {
      const itemsToUpdate = reorderedItems.map(item => ({
        id: item.id,
        sort_order: item.sort_order
      }));
      await reorderMutation.mutateAsync({ items: itemsToUpdate });
      setAllItems(reorderedItems);
    } catch (error) {
      console.error('Error reordering items:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Вы уверены, что хотите удалить ${selectedIds.length} элементов?`)) return;
    
    setIsBulkLoading(true);
    try {
      await bulkDeleteMutation.mutateAsync({ ids: selectedIds });
    } catch (error) {
      console.error('Error deleting items:', error);
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkToggleStatus = async () => {
    if (selectedIds.length === 0) return;
    
    // Determine new status based on selected items
    const selectedItems = filteredItems.filter(item => selectedIds.includes(item.id));
    const newStatus = selectedItems.some(item => !item.is_active);
    
    setIsBulkLoading(true);
    try {
      await bulkToggleMutation.mutateAsync({ ids: selectedIds, status: newStatus });
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkExport = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      const result = await trpc.dictionaryItems.bulkExport.query({
        ids: selectedIds,
        format: 'json',
        language: 'en'
      });
      
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dictionary-export-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Данные экспортированы');
    } catch (error) {
      console.error('Error exporting items:', error);
      toast.error('Ошибка при экспорте');
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const handleSelectItem = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Справочник: {code}</h1>
          <p className="text-slate-400">{items.length} элементов</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddItem} className="bg-blue-600 hover:bg-blue-500 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Добавить элемент
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingItem ? 'Редактировать элемент' : 'Добавить элемент'}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Заполните все обязательные поля
              </DialogDescription>
            </DialogHeader>
            <DictionaryItemForm
              item={editingItem}
              onSave={handleSaveItem}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Button 
          variant="outline" 
          className="border-white/10 text-white hover:bg-white/5"
          onClick={() => setIsImportModalOpen(true)}
        >
          <Upload className="w-4 h-4 mr-2" />
          Импорт
        </Button>

        <Button 
          variant="outline" 
          className="border-white/10 text-white hover:bg-white/5"
          onClick={() => setIsExportModalOpen(true)}
        >
          <Download className="w-4 h-4 mr-2" />
          Экспорт
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Поиск элементов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600"
        />
      </div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="pt-6 flex items-center justify-between">
            <span className="text-blue-400">Выбрано {selectedItems.size} элементов</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                selectedItems.forEach((id) => handleDeleteItem(id));
                setSelectedItems(new Set());
              }}
            >
              Удалить выбранные
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Элементы справочника</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Загрузка...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Элементы не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/10">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="border-white/20"
                      />
                    </TableHead>
                    <TableHead className="text-slate-300">Код</TableHead>
                    <TableHead className="text-slate-300">Название (РУ)</TableHead>
                    <TableHead className="text-slate-300">Название (EN)</TableHead>
                    <TableHead className="text-slate-300">Иконка</TableHead>
                    <TableHead className="text-slate-300">Цвет</TableHead>
                    <TableHead className="text-slate-300">Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={() => handleSelectItem(item.id)}
                          className="border-white/20"
                        />
                      </TableCell>
                      <TableCell className="text-slate-300 font-mono">{item.code}</TableCell>
                      <TableCell className="text-slate-300">{item.name}</TableCell>
                      <TableCell className="text-slate-300">{item.name_en || '—'}</TableCell>
                      <TableCell className="text-slate-300">{item.icon || '—'}</TableCell>
                      <TableCell>
                        {item.color && (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs text-slate-400">{item.color}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.is_active ? 'default' : 'outline'}
                          className={item.is_active ? 'bg-green-500/20 text-green-400' : ''}
                        >
                          {item.is_active ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </TableCell>
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
                            <DropdownMenuItem
                              onClick={() => handleEditItem(item)}
                              className="text-slate-300 hover:text-white cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-400 hover:text-red-300 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Import History Section */}
      <div className="mt-8">
        <ImportHistory dictionaryCode={code || ''} />
      </div>

      {/* Import Modal */}
      <DictionaryImportModal
        dictionaryCode={code || ''}
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          setIsImportModalOpen(false);
          toast.success('Данные успешно импортированы');
          // Reload items
        }}
      />

      {/* Export Modal */}
      <DictionaryExportModal
        dictionaryCode={code || ''}
        items={items}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

interface DictionaryItemFormProps {
  item: DictionaryItem | null;
  onSave: (item: DictionaryItem) => void;
  onCancel: () => void;
}

function DictionaryItemForm({ item, onSave, onCancel }: DictionaryItemFormProps) {
  const [formData, setFormData] = useState<Partial<DictionaryItem>>(
    item || {
      code: '',
      name: '',
      name_en: '',
      name_ru: '',
      name_uz: '',
      icon: '',
      color: '',
      symbol: '',
      sort_order: 0,
      is_active: true,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      toast.error('Заполните обязательные поля');
      return;
    }
    onSave(formData as DictionaryItem);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-200">Код *</Label>
          <Input
            value={formData.code || ''}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="код_элемента"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-200">Сортировка</Label>
          <Input
            type="number"
            value={formData.sort_order || 0}
            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-200">Название (РУ) *</Label>
        <Input
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value, name_ru: e.target.value })}
          placeholder="Название на русском"
          className="bg-white/5 border-white/10 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-200">Название (EN)</Label>
        <Input
          value={formData.name_en || ''}
          onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
          placeholder="English name"
          className="bg-white/5 border-white/10 text-white"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-200">Иконка</Label>
          <Input
            value={formData.icon || ''}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="📦"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-200">Цвет</Label>
          <Input
            type="color"
            value={formData.color || '#000000'}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="bg-white/5 border-white/10 text-white h-10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-200">Символ</Label>
          <Input
            value={formData.symbol || ''}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            placeholder="шт"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-white/10 text-white hover:bg-white/5"
        >
          Отмена
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white">
          Сохранить
        </Button>
      </div>
    </form>
  );
}

export default DictionaryItems;
