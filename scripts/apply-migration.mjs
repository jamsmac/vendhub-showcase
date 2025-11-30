import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function applyMigration() {
  let connection;
  try {
    console.log('🔄 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vendhub',
      port: process.env.DB_PORT || 3306,
    });

    console.log('✅ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, '../drizzle/migrations/0001_add_user_suspension_columns.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📝 Executing migration...');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`  → ${statement.trim().substring(0, 60)}...`);
        try {
          await connection.execute(statement);
        } catch (error) {
          // Ignore "already exists" errors
          if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_KEYNAME') {
            console.log(`  ⚠️  Column/index already exists (skipping)`);
          } else {
            throw error;
          }
        }
      }
    }

    console.log('✅ Migration applied successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

applyMigration();
