/**
 * Master Data Page - Central Hub for All Reference Books (Справочники)
 * 
 * Displays all 50+ dictionaries organized by categories:
 * - Products (Товары)
 * - Equipment (Оборудование)
 * - Tasks (Задачи)
 * - Finance (Финансы)
 * - Statuses (Статусы)
 * - Inventory (Инвентарь)
 * - Files (Файлы)
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  Wrench,
  CheckSquare,
  DollarSign,
  Settings,
  Package2,
  FileText,
  Plus,
  Search,
  Download,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

interface DictionaryCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  dictionaries: string[];
}

const categories: DictionaryCategory[] = [
  {
    id: 'products',
    name: 'Товары',
    icon: <Package className="w-5 h-5" />,
    description: 'Категории, единицы измерения, рецепты',
    dictionaries: ['product_categories', 'units_of_measure', 'recipe_types'],
  },
  {
    id: 'equipment',
    name: 'Оборудование',
    icon: <Wrench className="w-5 h-5" />,
    description: 'Компоненты, бункеры, запчасти, статусы',
    dictionaries: ['component_types', 'hopper_types', 'spare_part_types', 'component_statuses'],
  },
  {
    id: 'tasks',
    name: 'Задачи',
    icon: <CheckSquare className="w-5 h-5" />,
    description: 'Типы, статусы, приоритеты, причины откладывания',
    dictionaries: ['task_types', 'task_statuses', 'task_priorities', 'postpone_reasons'],
  },
  {
    id: 'finance',
    name: 'Финансы',
    icon: <DollarSign className="w-5 h-5" />,
    description: 'Платежи, расходы, доходы, НДС',
    dictionaries: ['payment_types', 'expense_categories', 'income_categories', 'vat_groups'],
  },
  {
    id: 'statuses',
    name: 'Статусы',
    icon: <Settings className="w-5 h-5" />,
    description: 'Аппараты, локации, контрагенты',
    dictionaries: ['machine_statuses', 'location_types', 'counterparty_types'],
  },
  {
    id: 'inventory',
    name: 'Инвентарь',
    icon: <Package2 className="w-5 h-5" />,
    description: 'Движения товаров, причины списания',
    dictionaries: ['inventory_movement_types', 'writeoff_reasons'],
  },
  {
    id: 'files',
    name: 'Файлы',
    icon: <FileText className="w-5 h-5" />,
    description: 'Категории файлов и документов',
    dictionaries: ['file_categories'],
  },
];

export function MasterData() {
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDictionary, setSelectedDictionary] = useState<string | null>(null);

  const currentCategory = categories.find((c) => c.id === activeTab);
  const filteredDictionaries = currentCategory?.dictionaries.filter((dict) =>
    dict.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleImport = () => {
    toast.info('Функция импорта в разработке');
  };

  const handleExport = () => {
    toast.info('Функция экспорта в разработке');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Справочники</h1>
        <p className="text-slate-400">
          Управление всеми справочниками системы: товары, оборудование, задачи и финансы
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button className="bg-blue-600 hover:bg-blue-500 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Добавить элемент
        </Button>
        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
          <Upload className="w-4 h-4 mr-2" />
          Импорт
        </Button>
        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
          <Download className="w-4 h-4 mr-2" />
          Экспорт
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Поиск справочников..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 bg-white/5 border border-white/10">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              {category.icon}
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            {/* Category Description */}
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-blue-400">{category.icon}</div>
                  <div>
                    <CardTitle className="text-white">{category.name}</CardTitle>
                    <CardDescription className="text-slate-400">{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Dictionary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDictionaries.length > 0 ? (
                filteredDictionaries.map((dictCode) => (
                  <DictionaryCard
                    key={dictCode}
                    code={dictCode}
                    isSelected={selectedDictionary === dictCode}
                    onSelect={() => setSelectedDictionary(dictCode)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-slate-400">Справочники не найдены</p>
                </div>
              )}
            </div>

            {/* Dictionary Details */}
            {selectedDictionary && (
              <DictionaryDetails code={selectedDictionary} />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Statistics */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Статистика</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-slate-400">Всего справочников</p>
              <p className="text-2xl font-bold text-white">21</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-400">Элементов</p>
              <p className="text-2xl font-bold text-white">150+</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-400">Языков</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-400">Категорий</p>
              <p className="text-2xl font-bold text-white">7</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface DictionaryCardProps {
  code: string;
  isSelected: boolean;
  onSelect: () => void;
}

function DictionaryCard({ code, isSelected, onSelect }: DictionaryCardProps) {
  const dictionaryNames: Record<string, { name: string; count: number; icon: string }> = {
    product_categories: { name: 'Категории товаров', count: 5, icon: '📦' },
    units_of_measure: { name: 'Единицы измерения', count: 6, icon: '⚖️' },
    recipe_types: { name: 'Типы рецептов', count: 3, icon: '📋' },
    component_types: { name: 'Типы компонентов', count: 6, icon: '⚙️' },
    hopper_types: { name: 'Типы бункеров', count: 6, icon: '🪣' },
    spare_part_types: { name: 'Типы запчастей', count: 11, icon: '🔧' },
    component_statuses: { name: 'Статусы компонентов', count: 7, icon: '🔴' },
    task_types: { name: 'Типы задач', count: 8, icon: '✓' },
    task_statuses: { name: 'Статусы задач', count: 7, icon: '📊' },
    task_priorities: { name: 'Приоритеты задач', count: 4, icon: '⚡' },
    postpone_reasons: { name: 'Причины откладывания', count: 8, icon: '⏸️' },
    payment_types: { name: 'Типы платежей', count: 4, icon: '💳' },
    expense_categories: { name: 'Категории расходов', count: 11, icon: '💸' },
    income_categories: { name: 'Категории доходов', count: 3, icon: '💰' },
    vat_groups: { name: 'НДС группы', count: 4, icon: '📈' },
    machine_statuses: { name: 'Статусы аппаратов', count: 5, icon: '🤖' },
    location_types: { name: 'Типы локаций', count: 9, icon: '📍' },
    counterparty_types: { name: 'Типы контрагентов', count: 6, icon: '🏢' },
    inventory_movement_types: { name: 'Типы движений товаров', count: 7, icon: '📦' },
    writeoff_reasons: { name: 'Причины списания', count: 7, icon: '🗑️' },
    file_categories: { name: 'Категории файлов', count: 11, icon: '📄' },
  };

  const dict = dictionaryNames[code];
  if (!dict) return null;

  return (
    <Card
      onClick={onSelect}
      className={`cursor-pointer transition-all ${
        isSelected
          ? 'bg-blue-500/20 border-blue-500/50'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{dict.icon}</span>
            <div>
              <CardTitle className="text-sm text-white">{dict.name}</CardTitle>
              <Badge variant="outline" className="mt-1 text-xs">
                {dict.count} элементов
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function DictionaryDetails({ code }: { code: string }) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Элементы справочника</CardTitle>
        <CardDescription className="text-slate-400">
          Нажмите на справочник для просмотра и редактирования элементов
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Код справочника: <span className="text-white font-mono">{code}</span></p>
          <div className="flex gap-2 pt-4">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Добавить элемент
            </Button>
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 text-sm">
              <Download className="w-4 h-4 mr-2" />
              Экспорт
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MasterData;
