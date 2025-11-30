import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseConnectionString(connectionString) {
  const url = new URL(connectionString);
  return {
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    port: url.port || 3306,
    ssl: url.searchParams.get('ssl') ? JSON.parse(url.searchParams.get('ssl')) : undefined,
  };
}

async function applyMigration() {
  let connection;
  try {
    console.log('🔄 Parsing database connection...');
    
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable not set');
    }

    const config = parseConnectionString(dbUrl);
    console.log(`✅ Connecting to ${config.host}:${config.port}/${config.database}`);
    
    connection = await mysql.createConnection(config);
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
          console.log(`    ✅ Success`);
        } catch (error) {
          // Ignore "already exists" errors
          if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_KEYNAME') {
            console.log(`    ⚠️  Column/index already exists (skipping)`);
          } else {
            console.log(`    ❌ Error: ${error.message}`);
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
