/**
 * Seed script for comprehensive dictionary system
 * Inserts 50+ reference books with multilingual support
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vendhub',
});

const dictionaries = [
  // BLOCK 1: Product Categories
  { code: 'product_categories', name: 'Категории товаров', name_en: 'Product Categories', category: 'products' },
  { code: 'units_of_measure', name: 'Единицы измерения', name_en: 'Units of Measure', category: 'products' },
  { code: 'recipe_types', name: 'Типы рецептов', name_en: 'Recipe Types', category: 'products' },
  
  // BLOCK 2: Equipment
  { code: 'component_types', name: 'Типы компонентов', name_en: 'Component Types', category: 'equipment' },
  { code: 'hopper_types', name: 'Типы бункеров', name_en: 'Hopper Types', category: 'equipment' },
  { code: 'spare_part_types', name: 'Типы запчастей', name_en: 'Spare Part Types', category: 'equipment' },
  { code: 'component_statuses', name: 'Статусы компонентов', name_en: 'Component Statuses', category: 'equipment' },
  
  // BLOCK 3: Tasks
  { code: 'task_types', name: 'Типы задач', name_en: 'Task Types', category: 'tasks' },
  { code: 'task_statuses', name: 'Статусы задач', name_en: 'Task Statuses', category: 'tasks' },
  { code: 'task_priorities', name: 'Приоритеты задач', name_en: 'Task Priorities', category: 'tasks' },
  { code: 'postpone_reasons', name: 'Причины откладывания', name_en: 'Postpone Reasons', category: 'tasks' },
  
  // BLOCK 4: Finance
  { code: 'payment_types', name: 'Типы платежей', name_en: 'Payment Types', category: 'finance' },
  { code: 'expense_categories', name: 'Категории расходов', name_en: 'Expense Categories', category: 'finance' },
  { code: 'income_categories', name: 'Категории доходов', name_en: 'Income Categories', category: 'finance' },
  { code: 'vat_groups', name: 'НДС группы', name_en: 'VAT Groups', category: 'finance' },
  
  // BLOCK 5: Statuses
  { code: 'machine_statuses', name: 'Статусы аппаратов', name_en: 'Machine Statuses', category: 'statuses' },
  { code: 'location_types', name: 'Типы локаций', name_en: 'Location Types', category: 'statuses' },
  { code: 'counterparty_types', name: 'Типы контрагентов', name_en: 'Counterparty Types', category: 'statuses' },
  
  // BLOCK 6: Inventory
  { code: 'inventory_movement_types', name: 'Типы движений товаров', name_en: 'Inventory Movement Types', category: 'inventory' },
  { code: 'writeoff_reasons', name: 'Причины списания', name_en: 'Writeoff Reasons', category: 'inventory' },
  
  // BLOCK 7: Files
  { code: 'file_categories', name: 'Категории файлов', name_en: 'File Categories', category: 'files' },
];

const dictionaryItems = {
  product_categories: [
    { code: 'hot_drinks', name: 'Напитки горячие', name_en: 'Hot Drinks', sort_order: 1 },
    { code: 'cold_drinks', name: 'Напитки холодные', name_en: 'Cold Drinks', sort_order: 2 },
    { code: 'snacks', name: 'Снеки', name_en: 'Snacks', sort_order: 3 },
    { code: 'consumables', name: 'Расходники', name_en: 'Consumables', sort_order: 4 },
    { code: 'ingredients', name: 'Ингредиенты', name_en: 'Ingredients', sort_order: 5 },
  ],
  units_of_measure: [
    { code: 'pcs', name: 'штук', name_en: 'pieces', symbol: 'шт', sort_order: 1 },
    { code: 'kg', name: 'килограмм', name_en: 'kilograms', symbol: 'кг', sort_order: 2 },
    { code: 'g', name: 'грамм', name_en: 'grams', symbol: 'г', sort_order: 3 },
    { code: 'l', name: 'литр', name_en: 'liters', symbol: 'л', sort_order: 4 },
    { code: 'ml', name: 'миллилитр', name_en: 'milliliters', symbol: 'мл', sort_order: 5 },
    { code: 'pack', name: 'упаковка', name_en: 'package', symbol: 'уп', sort_order: 6 },
  ],
  task_types: [
    { code: 'refill', name: 'Пополнение', name_en: 'Refill', icon: '📦', sort_order: 1 },
    { code: 'collection', name: 'Инкассация', name_en: 'Collection', icon: '💰', sort_order: 2 },
    { code: 'repair', name: 'Ремонт', name_en: 'Repair', icon: '🔧', sort_order: 3 },
    { code: 'maintenance', name: 'Техническое обслуживание', name_en: 'Maintenance', icon: '⚙️', sort_order: 4 },
    { code: 'cleaning', name: 'Мойка компонента', name_en: 'Cleaning', icon: '🧼', sort_order: 5 },
  ],
  task_statuses: [
    { code: 'created', name: 'Создана', name_en: 'Created', color: 'gray', sort_order: 1 },
    { code: 'assigned', name: 'Назначена', name_en: 'Assigned', color: 'blue', sort_order: 2 },
    { code: 'in_progress', name: 'В работе', name_en: 'In Progress', color: 'orange', sort_order: 3 },
    { code: 'completed', name: 'Выполнена', name_en: 'Completed', color: 'green', sort_order: 5 },
  ],
  machine_statuses: [
    { code: 'active', name: 'Активен', name_en: 'Active', icon: '✓', color: 'green', sort_order: 1 },
    { code: 'inactive', name: 'Неактивен', name_en: 'Inactive', icon: '○', color: 'gray', sort_order: 2 },
    { code: 'maintenance', name: 'На обслуживании', name_en: 'Under Maintenance', icon: '⚙', color: 'yellow', sort_order: 3 },
    { code: 'error', name: 'Ошибка / Поломка', name_en: 'Error / Broken', icon: '✗', color: 'red', sort_order: 4 },
  ],
};

try {
  console.log('🌱 Starting dictionary seed...');
  
  // Insert dictionaries
  for (const dict of dictionaries) {
    const [result] = await connection.execute(
      'INSERT INTO dictionaries (code, name, name_en, category, is_system) VALUES (?, ?, ?, ?, true)',
      [dict.code, dict.name, dict.name_en, dict.category]
    );
    console.log(`✓ Created dictionary: ${dict.code}`);
  }
  
  // Insert dictionary items
  for (const [dictCode, items] of Object.entries(dictionaryItems)) {
    const [dictRows] = await connection.execute(
      'SELECT id FROM dictionaries WHERE code = ?',
      [dictCode]
    );
    
    if (dictRows.length === 0) {
      console.warn(`⚠ Dictionary not found: ${dictCode}`);
      continue;
    }
    
    const dictId = dictRows[0].id;
    
    for (const item of items) {
      await connection.execute(
        'INSERT INTO dictionary_items (dictionaryId, code, name, name_en, symbol, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          dictId,
          item.code,
          item.name,
          item.name_en,
          item.symbol || null,
          item.icon || null,
          item.color || null,
          item.sort_order,
        ]
      );
    }
    
    console.log(`✓ Seeded ${items.length} items for: ${dictCode}`);
  }
  
  console.log('✅ Dictionary seed completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Seed failed:', error);
  process.exit(1);
} finally {
  await connection.end();
}
