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

async function fixProductsSchema() {
  let connection;
  try {
    console.log('🔄 Parsing database connection...');
    const config = parseConnectionString(process.env.DATABASE_URL);
    console.log(`✅ Connecting to ${config.host}:${config.port}/${config.database}`);
    
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database\n');

    console.log('📝 Checking products table schema...');
    
    // Check current schema
    const [columns] = await connection.execute(`DESCRIBE products`);
    console.log('Current products table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

    console.log('\n📝 Applying fixes if needed...');
    
    // Check if createdAt exists
    const hasCreatedAt = columns.some(col => col.Field === 'createdAt');
    const hasUpdatedAt = columns.some(col => col.Field === 'updatedAt');
    
    if (!hasCreatedAt) {
      await safeAddColumn(connection, 'products', 'createdAt', 'TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3) NOT NULL');
    }
    
    if (!hasUpdatedAt) {
      await safeAddColumn(connection, 'products', 'updatedAt', 'TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) NOT NULL');
    }

    console.log('\n✅ Products table schema check completed');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixProductsSchema();
