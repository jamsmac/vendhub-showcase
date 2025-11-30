/**
 * Custom Hook: useDictionaries
 * 
 * Provides access to dictionary data for use in forms and components
 * Handles caching and memoization for performance
 */

import { useEffect, useState, useMemo } from 'react';

export interface DictionaryItem {
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

export interface Dictionary {
  id: number;
  code: string;
  name: string;
  items: DictionaryItem[];
}

// Mock data for dictionaries (will be replaced with tRPC calls)
const mockDictionaries: Record<string, DictionaryItem[]> = {
  product_categories: [
    { id: 1, code: 'hot_drinks', name: 'Напитки горячие', name_en: 'Hot Drinks', sort_order: 1, is_active: true },
    { id: 2, code: 'cold_drinks', name: 'Напитки холодные', name_en: 'Cold Drinks', sort_order: 2, is_active: true },
    { id: 3, code: 'snacks', name: 'Снеки', name_en: 'Snacks', sort_order: 3, is_active: true },
  ],
  units_of_measure: [
    { id: 1, code: 'pcs', name: 'штук', name_en: 'pieces', symbol: 'шт', sort_order: 1, is_active: true },
    { id: 2, code: 'kg', name: 'килограмм', name_en: 'kilograms', symbol: 'кг', sort_order: 2, is_active: true },
    { id: 3, code: 'l', name: 'литр', name_en: 'liters', symbol: 'л', sort_order: 3, is_active: true },
  ],
  task_types: [
    { id: 1, code: 'refill', name: 'Пополнение', name_en: 'Refill', icon: '📦', sort_order: 1, is_active: true },
    { id: 2, code: 'maintenance', name: 'Техническое обслуживание', name_en: 'Maintenance', icon: '⚙️', sort_order: 2, is_active: true },
    { id: 3, code: 'repair', name: 'Ремонт', name_en: 'Repair', icon: '🔧', sort_order: 3, is_active: true },
  ],
  task_statuses: [
    { id: 1, code: 'created', name: 'Создана', name_en: 'Created', color: 'gray', sort_order: 1, is_active: true },
    { id: 2, code: 'in_progress', name: 'В работе', name_en: 'In Progress', color: 'orange', sort_order: 2, is_active: true },
    { id: 3, code: 'completed', name: 'Выполнена', name_en: 'Completed', color: 'green', sort_order: 3, is_active: true },
  ],
  machine_statuses: [
    { id: 1, code: 'active', name: 'Активен', name_en: 'Active', icon: '✓', color: 'green', sort_order: 1, is_active: true },
    { id: 2, code: 'maintenance', name: 'На обслуживании', name_en: 'Under Maintenance', icon: '⚙', color: 'yellow', sort_order: 2, is_active: true },
    { id: 3, code: 'error', name: 'Ошибка / Поломка', name_en: 'Error / Broken', icon: '✗', color: 'red', sort_order: 3, is_active: true },
  ],
  location_types: [
    { id: 1, code: 'shopping_mall', name: 'Торговый центр', name_en: 'Shopping Mall', sort_order: 1, is_active: true },
    { id: 2, code: 'office', name: 'Офисное здание', name_en: 'Office Building', sort_order: 2, is_active: true },
    { id: 3, code: 'transport_hub', name: 'Вокзал / Аэропорт', name_en: 'Transport Hub', sort_order: 3, is_active: true },
  ],
  counterparty_types: [
    { id: 1, code: 'supplier_goods', name: 'Поставщик товаров', name_en: 'Goods Supplier', sort_order: 1, is_active: true },
    { id: 2, code: 'supplier_equipment', name: 'Поставщик оборудования', name_en: 'Equipment Supplier', sort_order: 2, is_active: true },
    { id: 3, code: 'distributor', name: 'Дистрибьютор', name_en: 'Distributor', sort_order: 3, is_active: true },
  ],
};

/**
 * Hook to get dictionary items by code
 * @param code - Dictionary code (e.g., 'product_categories', 'task_types')
 * @returns Array of dictionary items
 */
export function useDictionary(code: string): DictionaryItem[] {
  const [items, setItems] = useState<DictionaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with tRPC call
    // const loadItems = async () => {
    //   try {
    //     const data = await trpc.dictionaries.getItems.query({ dictionaryCode: code });
    //     setItems(data);
    //   } catch (error) {
    //     console.error('Failed to load dictionary:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // loadItems();

    // Mock data for now
    setItems(mockDictionaries[code] || []);
    setIsLoading(false);
  }, [code]);

  return items;
}

/**
 * Hook to get all dictionaries by category
 * @param category - Category name (e.g., 'products', 'tasks')
 * @returns Array of dictionaries
 */
export function useDictionariesByCategory(category: string): Dictionary[] {
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with tRPC call
    // const loadDictionaries = async () => {
    //   try {
    //     const data = await trpc.dictionaries.getByCategory.query({ category });
    //     setDictionaries(data);
    //   } catch (error) {
    //     console.error('Failed to load dictionaries:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // loadDictionaries();

    setDictionaries([]);
    setIsLoading(false);
  }, [category]);

  return dictionaries;
}

/**
 * Hook to get dictionary items as select options
 * @param code - Dictionary code
 * @returns Array of options for Select component
 */
export function useDictionaryOptions(code: string) {
  const items = useDictionary(code);

  return useMemo(
    () =>
      items.map((item) => ({
        value: item.code,
        label: item.name,
        icon: item.icon,
        color: item.color,
      })),
    [items]
  );
}

/**
 * Hook to search dictionary items
 * @param code - Dictionary code
 * @param query - Search query
 * @returns Array of matching items
 */
export function useDictionarySearch(code: string, query: string) {
  const items = useDictionary(code);

  return useMemo(() => {
    if (!query) return items;

    const lowerQuery = query.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.code.toLowerCase().includes(lowerQuery) ||
        item.name_en?.toLowerCase().includes(lowerQuery)
    );
  }, [items, query]);
}

/**
 * Hook to get a single dictionary item by code
 * @param dictionaryCode - Dictionary code
 * @param itemCode - Item code
 * @returns Dictionary item or null
 */
export function useDictionaryItem(dictionaryCode: string, itemCode: string) {
  const items = useDictionary(dictionaryCode);

  return useMemo(
    () => items.find((item) => item.code === itemCode) || null,
    [items, itemCode]
  );
}

export default useDictionary;
