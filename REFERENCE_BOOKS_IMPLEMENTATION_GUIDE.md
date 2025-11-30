# Reference Books (Справочники) Implementation Guide

Complete guide for implementing the comprehensive reference books system in VendHub Manager.

## 📋 Overview

The reference books system provides centralized management of all master data (справочники) in VendHub Manager:

- **Locations** (Локации) - Places where vending machines are installed
- **Categories** (Категории) - Product categories
- **Units** (Единицы измерения) - Measurement units
- **Machine Types** (Типы аппаратов) - Vending machine models
- **Component Types** (Типы компонентов) - Equipment components
- **Task Types** (Типы задач) - Types of maintenance tasks
- **Supplier Types** (Типы поставщиков) - Supplier classifications

## 🗄️ Database Schema

### Tables Created

```sql
-- Reference Books Tables
locations              -- Места установки аппаратов
categories             -- Категории товаров
units                  -- Единицы измерения
machineTypes           -- Типы аппаратов
componentTypes         -- Типы компонентов
taskTypes              -- Типы задач
supplierTypes          -- Типы поставщиков
referenceBookAuditLog  -- Аудит справочников
```

### Schema Files

- **drizzle/0013_reference_books.sql** - SQL migration with all tables, indexes, views, and stored procedures
- **drizzle/schema-reference-books.ts** - Drizzle ORM TypeScript schema definitions

### Key Features

✅ **Audit Trail** - Track all changes to reference books  
✅ **Status Management** - active/inactive/archived states  
✅ **Relationships** - Foreign keys linking related entities  
✅ **Indexes** - Optimized queries for common operations  
✅ **Views** - Pre-built views for common queries  
✅ **Stored Procedures** - Business logic in database  

## 🔌 API Endpoints

### Location Endpoints

```typescript
// List locations
trpc.referenceBooks.locations.list.useQuery({
  status: 'active',
  city: 'Ташкент',
  search: 'вокзал'
})

// Get single location
trpc.referenceBooks.locations.get.useQuery({ id: 1 })

// Create location
trpc.referenceBooks.locations.create.useMutation({
  name: 'Центральный вокзал',
  type: 'transport',
  city: 'Ташкент',
  address: 'Ул. Амира Тимура, 1'
})

// Update location
trpc.referenceBooks.locations.update.useMutation({
  id: 1,
  data: { status: 'inactive' }
})

// Delete location
trpc.referenceBooks.locations.delete.useMutation({ id: 1 })
```

### Category Endpoints

```typescript
// List categories
trpc.referenceBooks.categories.list.useQuery({
  status: 'active',
  search: 'напитки'
})

// Create category
trpc.referenceBooks.categories.create.useMutation({
  name: 'Напитки',
  description: 'Безалкогольные напитки',
  icon: 'coffee',
  color: '#3B82F6'
})
```

### Unit Endpoints

```typescript
// List units by type
trpc.referenceBooks.units.list.useQuery({
  type: 'weight',
  status: 'active'
})

// Create unit
trpc.referenceBooks.units.create.useMutation({
  name: 'Килограмм',
  shortName: 'кг',
  type: 'weight'
})
```

### Machine Type Endpoints

```typescript
// List machine types
trpc.referenceBooks.machineTypes.list.useQuery({
  status: 'active',
  supportedProducts: 'both'
})

// Create machine type
trpc.referenceBooks.machineTypes.create.useMutation({
  name: 'VendMaster 3000',
  manufacturer: 'VendCorp',
  capacity: 500,
  supportedProducts: 'both'
})
```

### Component Type Endpoints

```typescript
// List component types
trpc.referenceBooks.componentTypes.list.useQuery({
  category: 'cooling',
  status: 'active'
})

// Create component type
trpc.referenceBooks.componentTypes.create.useMutation({
  name: 'Компрессор',
  category: 'cooling',
  averageLifespan: 1825  // 5 years in days
})
```

### Task Type Endpoints

```typescript
// List task types
trpc.referenceBooks.taskTypes.list.useQuery({
  status: 'active',
  priority: 'normal'
})

// Create task type
trpc.referenceBooks.taskTypes.create.useMutation({
  name: 'Пополнение',
  estimatedDuration: 30,
  requiresPhoto: true,
  priority: 'normal'
})
```

### Supplier Type Endpoints

```typescript
// List supplier types
trpc.referenceBooks.supplierTypes.list.useQuery({
  status: 'active'
})

// Create supplier type
trpc.referenceBooks.supplierTypes.create.useMutation({
  name: 'Производитель',
  description: 'Прямой производитель товаров'
})
```

## 🎨 UI Components

### Reference Book Form Component

```typescript
import { ReferenceBookForm } from '@/components/ReferenceBookForm';

export function LocationForm() {
  return (
    <ReferenceBookForm
      type="location"
      title="Добавить локацию"
      fields={[
        { name: 'name', label: 'Название', type: 'text', required: true },
        { name: 'type', label: 'Тип', type: 'select', options: LOCATION_TYPES },
        { name: 'city', label: 'Город', type: 'text' },
        { name: 'address', label: 'Адрес', type: 'text' },
        { name: 'contactPerson', label: 'Контактное лицо', type: 'text' },
        { name: 'contactPhone', label: 'Телефон', type: 'phone' },
        { name: 'contactEmail', label: 'Email', type: 'email' },
      ]}
      onSubmit={async (data) => {
        await trpc.referenceBooks.locations.create.mutate(data);
      }}
    />
  );
}
```

### Reference Book Table Component

```typescript
import { ReferenceBookTable } from '@/components/ReferenceBookTable';

export function LocationsTable() {
  const { data: locations } = trpc.referenceBooks.locations.list.useQuery({
    status: 'active'
  });

  return (
    <ReferenceBookTable
      type="location"
      data={locations || []}
      columns={[
        { key: 'name', label: 'Название' },
        { key: 'type', label: 'Тип' },
        { key: 'city', label: 'Город' },
        { key: 'machineCount', label: 'Аппаратов' },
        { key: 'status', label: 'Статус' },
      ]}
      onEdit={(item) => {/* handle edit */}}
      onDelete={(item) => {/* handle delete */}}
    />
  );
}
```

## 📄 Pages Structure

### Master Data Page (/master-data)

```
/master-data
├── Tabs
│   ├── Locations (Локации)
│   ├── Categories (Категории)
│   ├── Units (Единицы)
│   ├── Machine Types (Типы аппаратов)
│   ├── Component Types (Компоненты)
│   ├── Task Types (Типы задач)
│   └── Supplier Types (Типы поставщиков)
├── Search & Filter
├── Add New Button
├── Import Excel Button
└── Table/List View
```

### Individual Reference Book Pages

```
/reference-books/locations
├── Header with Title
├── Search & Filter
├── Add New Button
├── Table/Grid View
├── Bulk Actions
└── Export Button

/reference-books/categories
/reference-books/units
/reference-books/machine-types
/reference-books/component-types
/reference-books/task-types
/reference-books/supplier-types
```

## 🔗 Integration with Main Modules

### Machines Module

```typescript
// When creating/editing a machine
const { data: locations } = trpc.referenceBooks.locations.list.useQuery();
const { data: machineTypes } = trpc.referenceBooks.machineTypes.list.useQuery();

// Machine form includes location and machine type selects
<Select
  label="Локация"
  options={locations?.map(l => ({ value: l.id, label: l.name }))}
/>

<Select
  label="Тип аппарата"
  options={machineTypes?.map(mt => ({ value: mt.id, label: mt.name }))}
/>
```

### Products Module

```typescript
// When creating/editing a product
const { data: categories } = trpc.referenceBooks.categories.list.useQuery();
const { data: units } = trpc.referenceBooks.units.list.useQuery();

// Product form includes category and unit selects
<Select
  label="Категория"
  options={categories?.map(c => ({ value: c.id, label: c.name }))}
/>

<Select
  label="Единица измерения"
  options={units?.map(u => ({ value: u.id, label: u.shortName }))}
/>
```

### Tasks Module

```typescript
// When creating/editing a task
const { data: taskTypes } = trpc.referenceBooks.taskTypes.list.useQuery();
const { data: locations } = trpc.referenceBooks.locations.list.useQuery();

// Task form includes task type and location selects
<Select
  label="Тип задачи"
  options={taskTypes?.map(tt => ({ value: tt.id, label: tt.name }))}
/>

<Select
  label="Локация"
  options={locations?.map(l => ({ value: l.id, label: l.name }))}
/>
```

## 🤖 AI-Agent Integration

### AI-Agent for Reference Books

Each reference book can have an AI-agent that:

1. **Suggests Values** - Based on historical data and patterns
2. **Validates Entries** - Checks for duplicates and inconsistencies
3. **Auto-fills Fields** - Completes common fields automatically
4. **Learns from Feedback** - Improves suggestions over time

```typescript
// Example: AI-agent for locations
const { data: suggestion } = trpc.aiAgent.generateSuggestion.useQuery({
  agentType: 'locations',
  inputData: {
    name: 'Центральный вокзал',
    city: 'Ташкент'
  }
});

// AI suggests: type='transport', region='Ташкент'
```

## 📊 Audit & Compliance

### Audit Log

All changes to reference books are logged:

```typescript
// Get audit log
const { data: auditLog } = trpc.referenceBooks.auditLog.list.useQuery({
  entityType: 'location',
  entityId: 1,
  action: 'updated'
});

// Result:
// {
//   id: 1,
//   entityType: 'location',
//   entityId: 1,
//   action: 'updated',
//   oldValues: { status: 'active' },
//   newValues: { status: 'inactive' },
//   performedBy: 5,
//   performedByName: 'John Doe',
//   createdAt: '2025-11-30T10:00:00Z'
// }
```

## 🚀 Implementation Steps

### Phase 1: Database Setup
- [ ] Run SQL migration: `drizzle/0013_reference_books.sql`
- [ ] Verify tables created: `SHOW TABLES LIKE '%reference%'`
- [ ] Insert default data (units, task types, supplier types)
- [ ] Test foreign key relationships

### Phase 2: API Implementation
- [ ] Add referenceBooks router to main router
- [ ] Test all endpoints with Postman/REST client
- [ ] Verify validation schemas
- [ ] Test error handling

### Phase 3: UI Components
- [ ] Create ReferenceBookForm component
- [ ] Create ReferenceBookTable component
- [ ] Create ReferenceBookModal component
- [ ] Add search and filter functionality

### Phase 4: Pages
- [ ] Create /master-data page with tabs
- [ ] Create individual reference book pages
- [ ] Add navigation links
- [ ] Test all CRUD operations

### Phase 5: Integration
- [ ] Integrate with Machines module
- [ ] Integrate with Products module
- [ ] Integrate with Tasks module
- [ ] Integrate with Suppliers module

### Phase 6: AI-Agent Integration
- [ ] Create AI-agents for each reference book
- [ ] Add suggestion generation
- [ ] Add learning mechanism
- [ ] Test with real data

### Phase 7: Testing & Deployment
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Performance testing
- [ ] Deploy to production

## 📝 Default Data

### Units (Единицы измерения)
```
- Килограмм (кг)
- Литр (л)
- Штука (шт)
- Метр (м)
- Грамм (г)
- Миллилитр (мл)
- Упаковка (уп)
```

### Task Types (Типы задач)
```
- Пополнение (30 мин, требует фото)
- Техническое обслуживание (60 мин, требует фото)
- Чистка (45 мин, требует фото)
- Осмотр (15 мин)
- Ремонт (120 мин, требует фото)
```

### Supplier Types (Типы поставщиков)
```
- Производитель
- Дистрибьютор
- Розничный поставщик
- Логистический партнер
- Сервисный центр
```

### Location Types (Типы локаций)
```
- office (Офис)
- retail (Розница)
- transport (Транспорт)
- education (Образование)
- food_court (Пищевой двор)
- other (Другое)
```

## 🔍 Common Queries

### Get all active locations with machine count
```sql
SELECT l.*, COUNT(m.id) as machineCount
FROM locations l
LEFT JOIN machines m ON l.id = m.locationId
WHERE l.status = 'active'
GROUP BY l.id;
```

### Get products with category and unit info
```sql
SELECT p.*, c.name as categoryName, u.shortName as unitName
FROM products p
LEFT JOIN categories c ON p.categoryId = c.id
LEFT JOIN units u ON p.unitId = u.id
WHERE p.status = 'active';
```

### Get machine types with product support
```sql
SELECT *
FROM machineTypes
WHERE status = 'active'
AND supportedProducts IN ('both', 'beverages')
ORDER BY name;
```

## 🛠️ Troubleshooting

### Issue: Foreign key constraint fails
**Solution**: Ensure referenced records exist in parent tables first

### Issue: Duplicate entry error
**Solution**: Check unique constraints on name fields

### Issue: Query performance slow
**Solution**: Check indexes are created, run ANALYZE TABLE

### Issue: Audit log not recording
**Solution**: Verify trigger is created and enabled

## 📚 Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [MySQL Foreign Keys](https://dev.mysql.com/doc/refman/8.0/en/create-table-foreign-keys.html)
- [tRPC Documentation](https://trpc.io/)
- [React Query Documentation](https://tanstack.com/query/latest)

---

**All reference books infrastructure is ready for implementation! 🚀**
