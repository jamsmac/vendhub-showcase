# Database Schema Analysis - Failed Tests Investigation

## Summary
6 tests failed due to database schema inconsistencies. The tests are trying to query columns that are defined in the Drizzle schema but may not exist in the actual database.

## Failed Tests

### 1. auditLog.test.ts (2 failures)
- `should get admins` 
- `should return empty array for non-existent role`

### 2. inventoryEnhancements.test.ts (4 failures)
- `should get users by role`
- `should return empty array for non-existent role`
- `should get managers`
- (Related to getUsersByRole function)

## Root Cause

The `getUsersByRole()` function in `server/db.ts` (line 1497) executes:
```sql
SELECT `id`, `openId`, `name`, `email`, `loginMethod`, `role`, `createdAt`, 
       `updatedAt`, `lastSignedIn`, `telegramId`, `passwordHash`, 
       `twoFactorEnabled`, `emailNotifications`, `telegramNotifications`, 
       `status`, `suspendedAt`, `suspendedReason`, `suspendedBy` 
FROM `users` 
WHERE `users`.`role` = ?
```

**Error:** `Unknown column 'status' in 'field list'`

This indicates that the actual database table is missing these columns:
- `status`
- `suspendedAt`
- `suspendedReason`
- `suspendedBy`

## Schema Definition vs Reality

### Drizzle Schema (drizzle/schema.ts, lines 197-220)
The schema DEFINES these columns:
```typescript
status: mysqlEnum(['active','suspended','inactive']).default('active').notNull(),
suspendedAt: timestamp({ mode: 'string' }),
suspendedReason: text(),
suspendedBy: int(),
```

### Actual Database
These columns are **missing** from the actual `users` table.

## Why This Happened

1. The Drizzle schema was updated to include user suspension features
2. The database migration was NOT applied to the actual database
3. Tests run against the real database, which still has the old schema
4. The code tries to select these columns, causing the error

## Solution Required

### Option 1: Apply Database Migration (Recommended)
Run the migration command to sync the database with the schema:
```bash
pnpm db:push
```

This will:
1. Generate migration files from schema changes
2. Apply migrations to the database
3. Add the missing columns to the `users` table

### Option 2: Manual SQL Migration
If migrations don't work, manually add the columns:
```sql
ALTER TABLE users 
ADD COLUMN status ENUM('active','suspended','inactive') DEFAULT 'active' NOT NULL AFTER telegramNotifications,
ADD COLUMN suspendedAt TIMESTAMP NULL AFTER status,
ADD COLUMN suspendedReason TEXT NULL AFTER suspendedAt,
ADD COLUMN suspendedBy INT NULL AFTER suspendedReason,
ADD INDEX users_status_index (status);
```

## Affected Functions

The following database functions will fail until schema is fixed:
- `getUsersByRole()` - Used in tests and potentially in application code
- Any function that selects from `users` table with these new columns

## Next Steps

1. ✅ Identify the issue (DONE)
2. ⏳ Apply database migration (`pnpm db:push`)
3. ⏳ Run tests again to verify fixes
4. ⏳ Confirm all 121 tests pass

## Test Impact

- **Before Fix:** 6 failed, 115 passed
- **After Fix:** Expected 0 failed, 121 passed

## Files Involved

- `drizzle/schema.ts` - Schema definition (correct)
- `server/db.ts` - Database functions (correct)
- `server/auditLog.test.ts` - Test file (correct)
- `server/inventoryEnhancements.test.ts` - Test file (correct)
- Database `users` table - Missing columns (NEEDS FIX)
