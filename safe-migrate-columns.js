#!/usr/bin/env node
/**
 * Safe Column Migration Script
 * Renames columns from camelCase to snake_case only if they exist
 */

import mysql from 'mysql2/promise';
import 'dotenv/config';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

console.log('✅ Connected to database');

// Table migrations
const migrations = [
  {
    table: 'tasks',
    columns: [
      { from: 'machineId', to: 'machine_id', type: 'INT NULL' },
      { from: 'assignedTo', to: 'assigned_to', type: 'INT NULL' },
      { from: 'completedAt', to: 'completed_at', type: 'TIMESTAMP NULL' },
      { from: 'createdAt', to: 'created_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP' },
      { from: 'updatedAt', to: 'updated_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
    ],
  },
  {
    table: 'components',
    columns: [
      { from: 'machineId', to: 'machine_id', type: 'INT NOT NULL' },
      { from: 'componentType', to: 'component_type', type: "ENUM('compressor','cooling_system','payment_system','vending_mechanism','display','other') NOT NULL" },
      { from: 'lastMaintenance', to: 'last_maintenance', type: 'TIMESTAMP NULL' },
      { from: 'nextServiceDue', to: 'next_service_due', type: 'TIMESTAMP NULL' },
      { from: 'warrantyExpiry', to: 'warranty_expiry', type: 'TIMESTAMP NULL' },
      { from: 'createdAt', to: 'created_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP' },
      { from: 'updatedAt', to: 'updated_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
    ],
  },
  {
    table: 'componentHistory',
    columns: [
      { from: 'componentId', to: 'component_id', type: 'INT NOT NULL' },
      { from: 'performedBy', to: 'performed_by', type: 'INT NOT NULL' },
      { from: 'createdAt', to: 'created_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP' },
    ],
  },
  {
    table: 'transactions',
    columns: [
      { from: 'machineId', to: 'machine_id', type: 'INT NOT NULL' },
      { from: 'productId', to: 'product_id', type: 'INT NOT NULL' },
      { from: 'paymentMethod', to: 'payment_method', type: "ENUM('cash','card','mobile') NOT NULL" },
      { from: 'createdAt', to: 'created_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP' },
    ],
  },
  {
    table: 'suppliers',
    columns: [
      { from: 'createdAt', to: 'created_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP' },
      { from: 'updatedAt', to: 'updated_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
    ],
  },
  {
    table: 'stockTransfers',
    columns: [
      { from: 'productId', to: 'product_id', type: 'INT NOT NULL' },
      { from: 'fromLocation', to: 'from_location', type: 'INT NULL' },
      { from: 'toLocation', to: 'to_location', type: 'INT NULL' },
      { from: 'initiatedBy', to: 'initiated_by', type: 'INT NOT NULL' },
      { from: 'completedBy', to: 'completed_by', type: 'INT NULL' },
      { from: 'createdAt', to: 'created_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP' },
      { from: 'updatedAt', to: 'updated_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
    ],
  },
  {
    table: 'accessRequests',
    columns: [
      { from: 'userId', to: 'user_id', type: 'INT NOT NULL' },
      { from: 'requestedRole', to: 'requested_role', type: "ENUM('admin','manager','technician','viewer') NOT NULL" },
      { from: 'currentRole', to: 'current_role', type: "ENUM('admin','manager','technician','viewer') NULL" },
      { from: 'requestedBy', to: 'requested_by', type: 'INT NOT NULL' },
      { from: 'reviewedBy', to: 'reviewed_by', type: 'INT NULL' },
      { from: 'reviewedAt', to: 'reviewed_at', type: 'TIMESTAMP NULL' },
      { from: 'createdAt', to: 'created_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP' },
      { from: 'updatedAt', to: 'updated_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
    ],
  },
  {
    table: 'accessRequestAuditLogs',
    columns: [
      { from: 'requestId', to: 'request_id', type: 'INT NOT NULL' },
      { from: 'performedBy', to: 'performed_by', type: 'INT NOT NULL' },
      { from: 'createdAt', to: 'created_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP' },
    ],
  },
  {
    table: 'roleChanges',
    columns: [
      { from: 'userId', to: 'user_id', type: 'INT NOT NULL' },
      { from: 'oldRole', to: 'old_role', type: "ENUM('admin','manager','technician','viewer') NULL" },
      { from: 'newRole', to: 'new_role', type: "ENUM('admin','manager','technician','viewer') NOT NULL" },
      { from: 'changedBy', to: 'changed_by', type: 'INT NOT NULL' },
      { from: 'createdAt', to: 'created_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP' },
    ],
  },
  {
    table: 'digestConfig',
    columns: [
      { from: 'userId', to: 'user_id', type: 'INT NOT NULL' },
      { from: 'updatedAt', to: 'updated_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
    ],
  },
  {
    table: 'users',
    columns: [
      { from: 'passwordHash', to: 'password_hash', type: 'VARCHAR(255) NULL' },
      { from: 'telegramId', to: 'telegram_id', type: 'VARCHAR(255) NULL' },
      { from: 'lastLogin', to: 'last_login', type: 'TIMESTAMP NULL' },
      { from: 'isActive', to: 'is_active', type: 'BOOLEAN NOT NULL DEFAULT true' },
      { from: 'createdAt', to: 'created_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP' },
      { from: 'updatedAt', to: 'updated_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
    ],
  },
  {
    table: 'notifications',
    columns: [
      { from: 'userId', to: 'user_id', type: 'INT NOT NULL' },
      { from: 'isRead', to: 'is_read', type: 'BOOLEAN NOT NULL DEFAULT false' },
      { from: 'createdAt', to: 'created_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP' },
    ],
  },
];

// Helper function to check if column exists
async function columnExists(table, column) {
  const [rows] = await connection.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [process.env.DB_NAME, table, column]
  );
  return rows.length > 0;
}

// Migrate each table
let totalRenamed = 0;
let totalSkipped = 0;

for (const migration of migrations) {
  console.log(`\n📋 Processing table: ${migration.table}`);
  
  for (const col of migration.columns) {
    const exists = await columnExists(migration.table, col.from);
    
    if (exists) {
      try {
        const sql = `ALTER TABLE ${migration.table} CHANGE COLUMN ${col.from} ${col.to} ${col.type}`;
        await connection.query(sql);
        console.log(`  ✅ ${col.from} → ${col.to}`);
        totalRenamed++;
      } catch (error) {
        console.log(`  ❌ Failed to rename ${col.from}: ${error.message}`);
      }
    } else {
      console.log(`  ⏭️  ${col.from} (not found, skipping)`);
      totalSkipped++;
    }
  }
}

console.log(`\n✅ Migration complete!`);
console.log(`   Renamed: ${totalRenamed} columns`);
console.log(`   Skipped: ${totalSkipped} columns`);

await connection.end();
