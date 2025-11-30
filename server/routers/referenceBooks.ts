/**
 * Reference Books tRPC Router
 * 
 * Provides CRUD operations for all справочники (reference books):
 * - Locations (Локации)
 * - Categories (Категории)
 * - Units (Единицы измерения)
 * - Machine Types (Типы аппаратов)
 * - Component Types (Типы компонентов)
 * - Task Types (Типы задач)
 * - Supplier Types (Типы поставщиков)
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { db } from '../db';
import { eq, and, like, sql } from 'drizzle-orm';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const LocationSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  type: z.enum(['office', 'retail', 'transport', 'education', 'food_court', 'other']),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
  notes: z.string().optional(),
});

const CategorySchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  parentCategoryId: z.number().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.number().default(0),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
});

const UnitSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  shortName: z.string().min(1, 'Сокращение обязательно'),
  description: z.string().optional(),
  type: z.enum(['weight', 'volume', 'quantity', 'length', 'area', 'other']),
  status: z.enum(['active', 'inactive']).default('active'),
});

const MachineTypeSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  manufacturer: z.string().optional(),
  capacity: z.number().optional(),
  dimensions: z.string().optional(),
  weight: z.number().optional(),
  powerConsumption: z.number().optional(),
  coolingCapacity: z.number().optional(),
  supportedProducts: z.enum(['beverages', 'snacks', 'both', 'hot_drinks']),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
});

const ComponentTypeSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  averageLifespan: z.number().optional(),
  warrantyPeriod: z.number().optional(),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
});

const TaskTypeSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  estimatedDuration: z.number().optional(),
  priority: z.enum(['low', 'normal', 'urgent']).default('normal'),
  requiresPhoto: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
});

const SupplierTypeSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
});

// ============================================================================
// LOCATIONS ROUTER
// ============================================================================

const locationsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        status: z.enum(['active', 'inactive', 'archived']).optional(),
        city: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { locations } = await import('../db');
      const query = db.select().from(locations);

      if (input.status) {
        query.where(eq(locations.status, input.status));
      }
      if (input.city) {
        query.where(eq(locations.city, input.city));
      }
      if (input.search) {
        query.where(like(locations.name, `%${input.search}%`));
      }

      return query;
    }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const { locations } = await import('../db');
      return db.select().from(locations).where(eq(locations.id, input.id)).limit(1);
    }),

  create: protectedProcedure
    .input(LocationSchema)
    .mutation(async ({ input, ctx }) => {
      const { locations } = await import('../db');
      const result = await db.insert(locations).values({
        ...input,
        createdBy: ctx.user?.id,
      });
      return result;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: LocationSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      const { locations } = await import('../db');
      return db
        .update(locations)
        .set({
          ...input.data,
          updatedBy: ctx.user?.id,
        })
        .where(eq(locations.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { locations } = await import('../db');
      return db.delete(locations).where(eq(locations.id, input.id));
    }),
});

// ============================================================================
// CATEGORIES ROUTER
// ============================================================================

const categoriesRouter = router({
  list: publicProcedure
    .input(
      z.object({
        status: z.enum(['active', 'inactive', 'archived']).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { categories } = await import('../db');
      const query = db.select().from(categories);

      if (input.status) {
        query.where(eq(categories.status, input.status));
      }
      if (input.search) {
        query.where(like(categories.name, `%${input.search}%`));
      }

      return query.orderBy(categories.sortOrder);
    }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const { categories } = await import('../db');
      return db.select().from(categories).where(eq(categories.id, input.id)).limit(1);
    }),

  create: protectedProcedure
    .input(CategorySchema)
    .mutation(async ({ input, ctx }) => {
      const { categories } = await import('../db');
      return db.insert(categories).values({
        ...input,
        createdBy: ctx.user?.id,
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: CategorySchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      const { categories } = await import('../db');
      return db
        .update(categories)
        .set({
          ...input.data,
          updatedBy: ctx.user?.id,
        })
        .where(eq(categories.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { categories } = await import('../db');
      return db.delete(categories).where(eq(categories.id, input.id));
    }),
});

// ============================================================================
// UNITS ROUTER
// ============================================================================

const unitsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        type: z.enum(['weight', 'volume', 'quantity', 'length', 'area', 'other']).optional(),
        status: z.enum(['active', 'inactive']).optional(),
      })
    )
    .query(async ({ input }) => {
      const { units } = await import('../db');
      const query = db.select().from(units);

      if (input.type) {
        query.where(eq(units.type, input.type));
      }
      if (input.status) {
        query.where(eq(units.status, input.status));
      }

      return query;
    }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const { units } = await import('../db');
      return db.select().from(units).where(eq(units.id, input.id)).limit(1);
    }),

  create: protectedProcedure
    .input(UnitSchema)
    .mutation(async ({ input }) => {
      const { units } = await import('../db');
      return db.insert(units).values(input);
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: UnitSchema.partial() }))
    .mutation(async ({ input }) => {
      const { units } = await import('../db');
      return db.update(units).set(input.data).where(eq(units.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { units } = await import('../db');
      return db.delete(units).where(eq(units.id, input.id));
    }),
});

// ============================================================================
// MACHINE TYPES ROUTER
// ============================================================================

const machineTypesRouter = router({
  list: publicProcedure
    .input(
      z.object({
        status: z.enum(['active', 'inactive', 'archived']).optional(),
        supportedProducts: z.enum(['beverages', 'snacks', 'both', 'hot_drinks']).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { machineTypes } = await import('../db');
      const query = db.select().from(machineTypes);

      if (input.status) {
        query.where(eq(machineTypes.status, input.status));
      }
      if (input.supportedProducts) {
        query.where(eq(machineTypes.supportedProducts, input.supportedProducts));
      }
      if (input.search) {
        query.where(like(machineTypes.name, `%${input.search}%`));
      }

      return query;
    }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const { machineTypes } = await import('../db');
      return db.select().from(machineTypes).where(eq(machineTypes.id, input.id)).limit(1);
    }),

  create: protectedProcedure
    .input(MachineTypeSchema)
    .mutation(async ({ input, ctx }) => {
      const { machineTypes } = await import('../db');
      return db.insert(machineTypes).values({
        ...input,
        createdBy: ctx.user?.id,
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: MachineTypeSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      const { machineTypes } = await import('../db');
      return db
        .update(machineTypes)
        .set({
          ...input.data,
          updatedBy: ctx.user?.id,
        })
        .where(eq(machineTypes.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { machineTypes } = await import('../db');
      return db.delete(machineTypes).where(eq(machineTypes.id, input.id));
    }),
});

// ============================================================================
// COMPONENT TYPES ROUTER
// ============================================================================

const componentTypesRouter = router({
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        status: z.enum(['active', 'inactive', 'archived']).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { componentTypes } = await import('../db');
      const query = db.select().from(componentTypes);

      if (input.category) {
        query.where(eq(componentTypes.category, input.category));
      }
      if (input.status) {
        query.where(eq(componentTypes.status, input.status));
      }
      if (input.search) {
        query.where(like(componentTypes.name, `%${input.search}%`));
      }

      return query;
    }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const { componentTypes } = await import('../db');
      return db.select().from(componentTypes).where(eq(componentTypes.id, input.id)).limit(1);
    }),

  create: protectedProcedure
    .input(ComponentTypeSchema)
    .mutation(async ({ input, ctx }) => {
      const { componentTypes } = await import('../db');
      return db.insert(componentTypes).values({
        ...input,
        createdBy: ctx.user?.id,
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: ComponentTypeSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      const { componentTypes } = await import('../db');
      return db
        .update(componentTypes)
        .set({
          ...input.data,
          updatedBy: ctx.user?.id,
        })
        .where(eq(componentTypes.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { componentTypes } = await import('../db');
      return db.delete(componentTypes).where(eq(componentTypes.id, input.id));
    }),
});

// ============================================================================
// TASK TYPES ROUTER
// ============================================================================

const taskTypesRouter = router({
  list: publicProcedure
    .input(
      z.object({
        status: z.enum(['active', 'inactive', 'archived']).optional(),
        priority: z.enum(['low', 'normal', 'urgent']).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { taskTypes } = await import('../db');
      const query = db.select().from(taskTypes);

      if (input.status) {
        query.where(eq(taskTypes.status, input.status));
      }
      if (input.priority) {
        query.where(eq(taskTypes.priority, input.priority));
      }
      if (input.search) {
        query.where(like(taskTypes.name, `%${input.search}%`));
      }

      return query;
    }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const { taskTypes } = await import('../db');
      return db.select().from(taskTypes).where(eq(taskTypes.id, input.id)).limit(1);
    }),

  create: protectedProcedure
    .input(TaskTypeSchema)
    .mutation(async ({ input, ctx }) => {
      const { taskTypes } = await import('../db');
      return db.insert(taskTypes).values({
        ...input,
        createdBy: ctx.user?.id,
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: TaskTypeSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      const { taskTypes } = await import('../db');
      return db
        .update(taskTypes)
        .set({
          ...input.data,
          updatedBy: ctx.user?.id,
        })
        .where(eq(taskTypes.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { taskTypes } = await import('../db');
      return db.delete(taskTypes).where(eq(taskTypes.id, input.id));
    }),
});

// ============================================================================
// SUPPLIER TYPES ROUTER
// ============================================================================

const supplierTypesRouter = router({
  list: publicProcedure
    .input(
      z.object({
        status: z.enum(['active', 'inactive', 'archived']).optional(),
      })
    )
    .query(async ({ input }) => {
      const { supplierTypes } = await import('../db');
      const query = db.select().from(supplierTypes);

      if (input.status) {
        query.where(eq(supplierTypes.status, input.status));
      }

      return query;
    }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const { supplierTypes } = await import('../db');
      return db.select().from(supplierTypes).where(eq(supplierTypes.id, input.id)).limit(1);
    }),

  create: protectedProcedure
    .input(SupplierTypeSchema)
    .mutation(async ({ input, ctx }) => {
      const { supplierTypes } = await import('../db');
      return db.insert(supplierTypes).values({
        ...input,
        createdBy: ctx.user?.id,
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: SupplierTypeSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      const { supplierTypes } = await import('../db');
      return db
        .update(supplierTypes)
        .set({
          ...input.data,
          updatedBy: ctx.user?.id,
        })
        .where(eq(supplierTypes.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { supplierTypes } = await import('../db');
      return db.delete(supplierTypes).where(eq(supplierTypes.id, input.id));
    }),
});

// ============================================================================
// MAIN REFERENCE BOOKS ROUTER
// ============================================================================

export const referenceBooksRouter = router({
  locations: locationsRouter,
  categories: categoriesRouter,
  units: unitsRouter,
  machineTypes: machineTypesRouter,
  componentTypes: componentTypesRouter,
  taskTypes: taskTypesRouter,
  supplierTypes: supplierTypesRouter,
});

export type ReferenceBooksRouter = typeof referenceBooksRouter;
