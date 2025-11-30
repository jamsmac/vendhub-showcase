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

async function checkSchema() {
  let connection;
  try {
    const config = parseConnectionString(process.env.DATABASE_URL);
    connection = await mysql.createConnection(config);

    const [columns] = await connection.execute(`DESCRIBE users`);
    console.log('Current users table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkSchema();
