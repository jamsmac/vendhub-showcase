/**
 * Reference Books Schema Extension
 * Adds comprehensive справочники (reference books) support
 * 
 * Tables:
 * - locations (Локации/Места установки)
 * - categories (Категории товаров)
 * - units (Единицы измерения)
 * - machineTypes (Типы аппаратов)
 * - componentTypes (Типы компонентов)
 * - taskTypes (Типы задач)
 * - supplierTypes (Типы поставщиков)
 * - referenceBookAuditLog (Аудит справочников)
 */

import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  mysqlEnum,
  boolean,
  decimal,
  index,
  json,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

// ============================================================================
// LOCATIONS TABLE (Локации/Места установки)
// ============================================================================

export const locations = mysqlTable(
  'locations',
  {
    id: int().primaryKey().autoincrement(),
    name: varchar({ length: 255 }).notNull().unique(),
    type: mysqlEnum(['office', 'retail', 'transport', 'education', 'food_court', 'other'])
      .default('other')
      .notNull(),
    address: text(),
    city: varchar({ length: 100 }),
    region: varchar({ length: 100 }),
    postalCode: varchar({ length: 20 }),
    latitude: decimal({ precision: 10, scale: 8 }),
    longitude: decimal({ precision: 11, scale: 8 }),
    contactPerson: varchar({ length: 255 }),
    contactPhone: varchar({ length: 20 }),
    contactEmail: varchar({ length: 320 }),
    status: mysqlEnum(['active', 'inactive', 'archived']).default('active').notNull(),
    machineCount: int().default(0),
    notes: text(),
    createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp({ mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
    createdBy: int(),
    updatedBy: int(),
  },
  (table) => ({
    idxType: index('idx_locations_type').on(table.type),
    idxStatus: index('idx_locations_status').on(table.status),
    idxCity: index('idx_locations_city').on(table.city),
    idxName: index('idx_locations_name').on(table.name),
  })
);

// ============================================================================
// CATEGORIES TABLE (Категории товаров)
// ============================================================================

export const categories = mysqlTable(
  'categories',
  {
    id: int().primaryKey().autoincrement(),
    name: varchar({ length: 255 }).notNull().unique(),
    description: text(),
    parentCategoryId: int(),
    icon: varchar({ length: 100 }),
    color: varchar({ length: 7 }),
    sortOrder: int().default(0),
    status: mysqlEnum(['active', 'inactive', 'archived']).default('active').notNull(),
    createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp({ mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
    createdBy: int(),
    updatedBy: int(),
  },
  (table) => ({
    idxParent: index('idx_categories_parent').on(table.parentCategoryId),
    idxStatus: index('idx_categories_status').on(table.status),
  })
);

// ============================================================================
// UNITS TABLE (Единицы измерения)
// ============================================================================

export const units = mysqlTable(
  'units',
  {
    id: int().primaryKey().autoincrement(),
    name: varchar({ length: 50 }).notNull().unique(),
    shortName: varchar({ length: 10 }).notNull().unique(),
    description: text(),
    type: mysqlEnum(['weight', 'volume', 'quantity', 'length', 'area', 'other'])
      .default('quantity')
      .notNull(),
    status: mysqlEnum(['active', 'inactive']).default('active').notNull(),
    createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp({ mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    idxType: index('idx_units_type').on(table.type),
    idxStatus: index('idx_units_status').on(table.status),
  })
);

// ============================================================================
// MACHINE TYPES TABLE (Типы аппаратов)
// ============================================================================

export const machineTypes = mysqlTable(
  'machineTypes',
  {
    id: int().primaryKey().autoincrement(),
    name: varchar({ length: 255 }).notNull().unique(),
    description: text(),
    manufacturer: varchar({ length: 255 }),
    capacity: int(),
    dimensions: varchar({ length: 100 }),
    weight: int(),
    powerConsumption: int(),
    coolingCapacity: int(),
    supportedProducts: mysqlEnum(['beverages', 'snacks', 'both', 'hot_drinks'])
      .default('both')
      .notNull(),
    status: mysqlEnum(['active', 'inactive', 'archived']).default('active').notNull(),
    createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp({ mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
    createdBy: int(),
    updatedBy: int(),
  },
  (table) => ({
    idxStatus: index('idx_machineTypes_status').on(table.status),
  })
);

// ============================================================================
// COMPONENT TYPES TABLE (Типы компонентов)
// ============================================================================

export const componentTypes = mysqlTable(
  'componentTypes',
  {
    id: int().primaryKey().autoincrement(),
    name: varchar({ length: 255 }).notNull().unique(),
    description: text(),
    category: varchar({ length: 100 }),
    manufacturer: varchar({ length: 255 }),
    averageLifespan: int(), // in days
    warrantyPeriod: int(), // in days
    status: mysqlEnum(['active', 'inactive', 'archived']).default('active').notNull(),
    createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp({ mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
    createdBy: int(),
    updatedBy: int(),
  },
  (table) => ({
    idxCategory: index('idx_componentTypes_category').on(table.category),
    idxStatus: index('idx_componentTypes_status').on(table.status),
  })
);

// ============================================================================
// TASK TYPES TABLE (Типы задач)
// ============================================================================

export const taskTypes = mysqlTable(
  'taskTypes',
  {
    id: int().primaryKey().autoincrement(),
    name: varchar({ length: 255 }).notNull().unique(),
    description: text(),
    estimatedDuration: int(), // in minutes
    priority: mysqlEnum(['low', 'normal', 'urgent']).default('normal').notNull(),
    requiresPhoto: boolean().default(false),
    requiresApproval: boolean().default(false),
    status: mysqlEnum(['active', 'inactive', 'archived']).default('active').notNull(),
    createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp({ mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
    createdBy: int(),
    updatedBy: int(),
  },
  (table) => ({
    idxStatus: index('idx_taskTypes_status').on(table.status),
  })
);

// ============================================================================
// SUPPLIER TYPES TABLE (Типы поставщиков)
// ============================================================================

export const supplierTypes = mysqlTable(
  'supplierTypes',
  {
    id: int().primaryKey().autoincrement(),
    name: varchar({ length: 255 }).notNull().unique(),
    description: text(),
    status: mysqlEnum(['active', 'inactive', 'archived']).default('active').notNull(),
    createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp({ mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    idxStatus: index('idx_supplierTypes_status').on(table.status),
  })
);

// ============================================================================
// REFERENCE BOOK AUDIT LOG TABLE
// ============================================================================

export const referenceBookAuditLog = mysqlTable(
  'referenceBookAuditLog',
  {
    id: int().primaryKey().autoincrement(),
    entityType: mysqlEnum([
      'location',
      'category',
      'unit',
      'machineType',
      'componentType',
      'taskType',
      'supplierType',
    ]).notNull(),
    entityId: int().notNull(),
    action: mysqlEnum(['created', 'updated', 'deleted', 'archived']).notNull(),
    oldValues: json(),
    newValues: json(),
    performedBy: int(),
    performedByName: varchar({ length: 255 }),
    reason: text(),
    createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    idxEntity: index('idx_audit_entity').on(table.entityType, table.entityId),
    idxAction: index('idx_audit_action').on(table.action),
    idxDate: index('idx_audit_date').on(table.createdAt),
  })
);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Unit = typeof units.$inferSelect;
export type NewUnit = typeof units.$inferInsert;

export type MachineType = typeof machineTypes.$inferSelect;
export type NewMachineType = typeof machineTypes.$inferInsert;

export type ComponentType = typeof componentTypes.$inferSelect;
export type NewComponentType = typeof componentTypes.$inferInsert;

export type TaskType = typeof taskTypes.$inferSelect;
export type NewTaskType = typeof taskTypes.$inferInsert;

export type SupplierType = typeof supplierTypes.$inferSelect;
export type NewSupplierType = typeof supplierTypes.$inferInsert;

export type ReferenceBookAuditLog = typeof referenceBookAuditLog.$inferSelect;
export type NewReferenceBookAuditLog = typeof referenceBookAuditLog.$inferInsert;

// ============================================================================
// ENUMS FOR TYPE SAFETY
// ============================================================================

export const LOCATION_TYPES = ['office', 'retail', 'transport', 'education', 'food_court', 'other'] as const;
export const ENTITY_STATUS = ['active', 'inactive', 'archived'] as const;
export const UNIT_TYPES = ['weight', 'volume', 'quantity', 'length', 'area', 'other'] as const;
export const SUPPORTED_PRODUCTS = ['beverages', 'snacks', 'both', 'hot_drinks'] as const;
export const AUDIT_ACTIONS = ['created', 'updated', 'deleted', 'archived'] as const;

// ============================================================================
// EXPORTS
// ============================================================================

export const referenceBooksTables = [
  locations,
  categories,
  units,
  machineTypes,
  componentTypes,
  taskTypes,
  supplierTypes,
  referenceBookAuditLog,
];

export default {
  locations,
  categories,
  units,
  machineTypes,
  componentTypes,
  taskTypes,
  supplierTypes,
  referenceBookAuditLog,
};
