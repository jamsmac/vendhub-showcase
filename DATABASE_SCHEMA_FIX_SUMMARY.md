# Database Schema Fix Summary

## Problem

Drizzle ORM was generating SQL queries with snake_case column names (`serial_number`, `last_maintenance`), but the database tables were created with camelCase column names (`serialNumber`, `lastMaintenance`).

This caused errors like:
```
Unknown column 'machines.serial_number' in 'field list'
```

## Root Cause

- Drizzle ORM for MySQL automatically converts camelCase field names to snake_case in SQL queries
- The database was initially created with camelCase column names
- Mismatch between schema definition and actual database structure

## Solution

Renamed all database columns from camelCase to snake_case to match Drizzle ORM's default behavior.

## Tables Fixed

### ✅ Completed
1. **machines** - 7 columns renamed
   - serialNumber → serial_number
   - lastMaintenance → last_maintenance
   - nextServiceDue → next_service_due
   - createdAt → created_at
   - updatedAt → updated_at

2. **inventory** - 3 columns renamed
   - productId → product_id
   - locationId → location_id
   - updatedAt → updated_at

### ⏳ Remaining (Need Manual Migration)

The following tables still need column renaming:

3. **products** (3 columns)
4. **inventoryAdjustments** (11 columns)
5. **tasks** (6 columns)
6. **components** (7 columns)
7. **componentHistory** (4 columns)
8. **transactions** (5 columns)
9. **suppliers** (2 columns)
10. **stockTransfers** (7 columns)
11. **accessRequests** (9 columns)
12. **accessRequestAuditLogs** (4 columns)
13. **roleChanges** (5 columns)
14. **digestConfig** (2 columns)
15. **users** (8 columns)
16. **notifications** (3 columns)

## Migration Script

Complete SQL migration script available at:
- `/home/ubuntu/vendhub-showcase/fix-column-names.sql`
- `/tmp/rename-columns.sql`

## Testing

After fixing machines and inventory tables:
- ✅ Server starts without errors
- ✅ No TypeScript compilation errors
- ✅ No LSP errors

## Next Steps

1. Complete remaining table migrations using the SQL script
2. Test all API endpoints
3. Verify all queries work correctly
4. Run full test suite
5. Create checkpoint

## Prevention

To prevent this issue in the future:
- Always use snake_case for database column names in Drizzle schema
- OR configure Drizzle to preserve camelCase (not recommended for MySQL)
- Run `pnpm db:push` after schema changes to keep database in sync

## Files Modified

- `drizzle.config.ts` - Temporarily added `casing: "preserve"` (later removed)
- Database tables: machines, inventory (renamed columns)

## Status

**Partially Fixed** - Core tables (machines, inventory) are working. Remaining tables need migration before their features can be used without errors.
