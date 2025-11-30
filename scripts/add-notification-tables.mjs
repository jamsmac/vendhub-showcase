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

async function addNotificationTables() {
  let connection;
  try {
    console.log('🔄 Connecting to database...');
    const config = parseConnectionString(process.env.DATABASE_URL);
    connection = await mysql.createConnection(config);
    console.log('✅ Connected\n');

    console.log('📝 Creating notification tables...\n');

    // Create notificationPreferences table
    console.log('  → Creating notificationPreferences table...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS notificationPreferences (
          id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
          userId INT NOT NULL,
          emailAlerts BOOLEAN DEFAULT true NOT NULL,
          telegramAlerts BOOLEAN DEFAULT true NOT NULL,
          emailCritical BOOLEAN DEFAULT true NOT NULL,
          emailWarning BOOLEAN DEFAULT true NOT NULL,
          emailInfo BOOLEAN DEFAULT false NOT NULL,
          telegramCritical BOOLEAN DEFAULT true NOT NULL,
          telegramWarning BOOLEAN DEFAULT true NOT NULL,
          telegramInfo BOOLEAN DEFAULT false NOT NULL,
          quietHoursStart VARCHAR(5),
          quietHoursEnd VARCHAR(5),
          timezone VARCHAR(50) DEFAULT 'UTC' NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
          INDEX notificationPreferences_userId_idx (userId)
        )
      `);
      console.log('    ✅ Created notificationPreferences table');
    } catch (error) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('    ⚠️  notificationPreferences table already exists');
      } else {
        throw error;
      }
    }

    // Create alertNotifications table
    console.log('  → Creating alertNotifications table...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS alertNotifications (
          id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
          alertId INT NOT NULL,
          userId INT NOT NULL,
          channel ENUM('email', 'telegram', 'in-app') NOT NULL,
          status ENUM('pending', 'sent', 'failed', 'skipped') DEFAULT 'pending' NOT NULL,
          sentAt TIMESTAMP NULL,
          failureReason TEXT,
          retryCount INT DEFAULT 0 NOT NULL,
          maxRetries INT DEFAULT 3 NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          INDEX alertNotifications_alertId_idx (alertId),
          INDEX alertNotifications_userId_idx (userId),
          INDEX alertNotifications_status_idx (status),
          INDEX alertNotifications_channel_idx (channel)
        )
      `);
      console.log('    ✅ Created alertNotifications table');
    } catch (error) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('    ⚠️  alertNotifications table already exists');
      } else {
        throw error;
      }
    }

    // Create notificationLog table
    console.log('  → Creating notificationLog table...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS notificationLog (
          id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
          userId INT NOT NULL,
          channel ENUM('email', 'telegram', 'in-app') NOT NULL,
          subject VARCHAR(255),
          message TEXT NOT NULL,
          recipientEmail VARCHAR(320),
          recipientTelegramId VARCHAR(64),
          status ENUM('sent', 'failed', 'skipped') NOT NULL,
          errorMessage TEXT,
          sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          INDEX notificationLog_userId_idx (userId),
          INDEX notificationLog_channel_idx (channel),
          INDEX notificationLog_sentAt_idx (sentAt)
        )
      `);
      console.log('    ✅ Created notificationLog table');
    } catch (error) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('    ⚠️  notificationLog table already exists');
      } else {
        throw error;
      }
    }

    console.log('\n✅ All notification tables created successfully');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addNotificationTables();
