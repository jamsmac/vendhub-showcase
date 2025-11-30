# Справочники (Dictionary System) - Integration Guide

## 📋 Overview

Полная система справочников (reference books) для VendHub Manager с поддержкой 50+ словарей и мультиязычности (РУ, EN, UZ).

## 🗂️ Структура Справочников

### Категория: Товары (Products)
- **product_categories** - Категории товаров (напитки горячие, холодные, снеки)
- **units_of_measure** - Единицы измерения (шт, кг, л, мл, упаковка)
- **recipe_types** - Типы рецептов

### Категория: Оборудование (Equipment)
- **component_types** - Типы компонентов (компрессор, вентилятор, насос)
- **hopper_types** - Типы бункеров
- **spare_part_types** - Типы запчастей
- **component_statuses** - Статусы компонентов (новый, рабочий, изношенный, неисправный)

### Категория: Задачи (Tasks)
- **task_types** - Типы задач (пополнение, инкассация, ремонт, ТО, мойка)
- **task_statuses** - Статусы задач (создана, назначена, в работе, выполнена)
- **task_priorities** - Приоритеты задач (низкий, средний, высокий, критический)
- **postpone_reasons** - Причины откладывания

### Категория: Финансы (Finance)
- **payment_types** - Типы платежей (наличные, карта, перевод, чек)
- **expense_categories** - Категории расходов (зарплата, аренда, коммунальные, топливо)
- **income_categories** - Категории доходов (продажи, услуги, комиссии)
- **vat_groups** - НДС группы (0%, 5%, 12%, 15%)

### Категория: Статусы (Statuses)
- **machine_statuses** - Статусы аппаратов (активен, неактивен, на ТО, ошибка)
- **location_types** - Типы локаций (торговый центр, офис, вокзал, школа, кафе)
- **counterparty_types** - Типы контрагентов (поставщик товаров, поставщик оборудования, дистрибьютор)

### Категория: Инвентарь (Inventory)
- **inventory_movement_types** - Типы движений товаров (поступление, отпуск, возврат, списание)
- **writeoff_reasons** - Причины списания (истечение срока, брак, потеря, кража)

### Категория: Файлы (Files)
- **file_categories** - Категории файлов (документы, фото, видео, отчеты)

## 📄 Примеры Интеграции

### 1. Machines Module

```typescript
import { useDictionaryOptions } from '@/hooks/useDictionaries';

function MachineForm() {
  const machineStatuses = useDictionaryOptions('machine_statuses');
  const locationTypes = useDictionaryOptions('location_types');

  return (
    <>
      <Select options={machineStatuses} label="Статус" />
      <Select options={locationTypes} label="Тип локации" />
    </>
  );
}
```

### 2. Products Module

```typescript
function ProductForm() {
  const categories = useDictionaryOptions('product_categories');
  const units = useDictionaryOptions('units_of_measure');

  return (
    <>
      <Select options={categories} label="Категория" />
      <Select options={units} label="Единица измерения" />
    </>
  );
}
```

### 3. Tasks Module

```typescript
function TaskForm() {
  const taskTypes = useDictionaryOptions('task_types');
  const taskStatuses = useDictionaryOptions('task_statuses');
  const taskPriorities = useDictionaryOptions('task_priorities');

  return (
    <>
      <Select options={taskTypes} label="Тип задачи" />
      <Select options={taskStatuses} label="Статус" />
      <Select options={taskPriorities} label="Приоритет" />
    </>
  );
}
```

## 🚀 Deployment Steps

### 1. Run Database Migration
```bash
pnpm db:push
```

### 2. Seed Dictionary Data
```bash
node scripts/seed-dictionaries.mjs
```

### 3. Add Router to tRPC
```typescript
// server/index.ts
import { dictionariesRouter } from './routers/dictionaries';

export const appRouter = router({
  dictionaries: dictionariesRouter,
  // ... other routers
});
```

### 4. Update Module Forms
- [ ] Update MachineForm.tsx (✓ Done)
- [ ] Update ProductForm.tsx
- [ ] Update TaskForm.tsx
- [ ] Update SupplierForm.tsx

