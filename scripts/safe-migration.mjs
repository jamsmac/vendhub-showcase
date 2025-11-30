import mysql from 'mysql2/promise';
import { URL } from 'url';

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

async function safeAddColumn(connection, table, column, definition) {
  try {
    // Check if column exists
    const [columns] = await connection.execute(`DESCRIBE ${table}`);
    const exists = columns.some(col => col.Field === column);
    
    if (exists) {
      console.log(`  ⚠️  Column '${column}' already exists`);
      return;
    }
    
    const sql = `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`;
    console.log(`  → Adding column '${column}'...`);
    await connection.execute(sql);
    console.log(`    ✅ Success`);
  } catch (error) {
    console.log(`    ❌ Error: ${error.message}`);
    throw error;
  }
}

async function safeAddIndex(connection, table, indexName, column) {
  try {
    const [indexes] = await connection.execute(`SHOW INDEX FROM ${table}`);
    const exists = indexes.some(idx => idx.Key_name === indexName);
    
    if (exists) {
      console.log(`  ⚠️  Index '${indexName}' already exists`);
      return;
    }
    
    const sql = `ALTER TABLE ${table} ADD INDEX ${indexName} (${column})`;
    console.log(`  → Adding index '${indexName}'...`);
    await connection.execute(sql);
    console.log(`    ✅ Success`);
  } catch (error) {
    console.log(`    ❌ Error: ${error.message}`);
    throw error;
  }
}

async function applyMigration() {
  let connection;
  try {
    console.log('🔄 Parsing database connection...');
    const config = parseConnectionString(process.env.DATABASE_URL);
    console.log(`✅ Connecting to ${config.host}:${config.port}/${config.database}`);
    
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database\n');

    console.log('📝 Applying migration: Add user suspension columns...');
    
    // Add columns one by one with safety checks
    await safeAddColumn(connection, 'users', 'status', "ENUM('active','suspended','inactive') DEFAULT 'active' NOT NULL");
    await safeAddColumn(connection, 'users', 'suspendedAt', 'TIMESTAMP NULL');
    await safeAddColumn(connection, 'users', 'suspendedReason', 'TEXT NULL');
    await safeAddColumn(connection, 'users', 'suspendedBy', 'INT NULL');
    
    // Add index
    await safeAddIndex(connection, 'users', 'users_status_index', 'status');

    console.log('\n✅ Migration completed successfully');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

applyMigration();
