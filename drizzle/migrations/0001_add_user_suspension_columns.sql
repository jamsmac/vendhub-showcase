-- Add user suspension feature columns to users table
ALTER TABLE users 
ADD COLUMN status ENUM('active','suspended','inactive') DEFAULT 'active' NOT NULL AFTER telegramNotifications,
ADD COLUMN suspendedAt TIMESTAMP NULL AFTER status,
ADD COLUMN suspendedReason TEXT NULL AFTER suspendedAt,
ADD COLUMN suspendedBy INT NULL AFTER suspendedReason,
ADD INDEX users_status_index (status);
