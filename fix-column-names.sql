-- Fix column naming from camelCase to snake_case
-- This script renames all columns to match Drizzle ORM's default snake_case convention

-- Fix machines table
ALTER TABLE machines 
  CHANGE COLUMN serialNumber serial_number VARCHAR(100) NOT NULL,
  CHANGE COLUMN lastMaintenance last_maintenance TIMESTAMP NULL,
  CHANGE COLUMN nextServiceDue next_service_due TIMESTAMP NULL,
  CHANGE COLUMN totalRevenue total_revenue INT NOT NULL DEFAULT 0,
  CHANGE COLUMN totalSales total_sales INT NOT NULL DEFAULT 0,
  CHANGE COLUMN createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHANGE COLUMN updatedAt updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Fix inventory table
ALTER TABLE inventory
  CHANGE COLUMN productId product_id INT NOT NULL,
  CHANGE COLUMN locationId location_id INT NULL,
  CHANGE COLUMN updatedAt updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Fix products table  
ALTER TABLE products
  CHANGE COLUMN costPrice cost_price INT NOT NULL,
  CHANGE COLUMN sellingPrice selling_price INT NOT NULL,
  CHANGE COLUMN createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Fix inventoryAdjustments table
ALTER TABLE inventoryAdjustments
  CHANGE COLUMN inventoryId inventory_id INT NOT NULL,
  CHANGE COLUMN productId product_id INT NOT NULL,
  CHANGE COLUMN adjustmentType adjustment_type ENUM('damage','shrinkage','correction','found','expired','returned') NOT NULL,
  CHANGE COLUMN quantityBefore quantity_before INT NOT NULL,
  CHANGE COLUMN quantityAfter quantity_after INT NOT NULL,
  CHANGE COLUMN quantityChange quantity_change INT NOT NULL,
  CHANGE COLUMN photoUrl photo_url TEXT NULL,
  CHANGE COLUMN performedBy performed_by INT NOT NULL,
  CHANGE COLUMN performedByName performed_by_name VARCHAR(255) NULL,
  CHANGE COLUMN locationId location_id INT NULL,
  CHANGE COLUMN createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Fix tasks table
ALTER TABLE tasks
  CHANGE COLUMN machineId machine_id INT NULL,
  CHANGE COLUMN assignedTo assigned_to INT NULL,
  CHANGE COLUMN dueDate due_date TIMESTAMP NULL,
  CHANGE COLUMN completedAt completed_at TIMESTAMP NULL,
  CHANGE COLUMN createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHANGE COLUMN updatedAt updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Fix components table
ALTER TABLE components
  CHANGE COLUMN serialNumber serial_number VARCHAR(100) NOT NULL,
  CHANGE COLUMN currentMachineId current_machine_id INT NULL,
  CHANGE COLUMN installationDate installation_date TIMESTAMP NULL,
  CHANGE COLUMN nextServiceDue next_service_due TIMESTAMP NULL,
  CHANGE COLUMN healthScore health_score INT DEFAULT 100,
  CHANGE COLUMN createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHANGE COLUMN updatedAt updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Fix componentHistory table
ALTER TABLE componentHistory
  CHANGE COLUMN componentId component_id INT NOT NULL,
  CHANGE COLUMN eventType event_type ENUM('installation','removal','repair','maintenance','purchase') NOT NULL,
  CHANGE COLUMN machineId machine_id INT NULL,
  CHANGE COLUMN performedBy performed_by INT NULL,
  CHANGE COLUMN createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Fix transactions table
ALTER TABLE transactions
  CHANGE COLUMN machineId machine_id INT NULL,
  CHANGE COLUMN productId product_id INT NULL,
  CHANGE COLUMN transactionType transaction_type ENUM('sale','refund','adjustment') NOT NULL,
  CHANGE COLUMN paymentMethod payment_method VARCHAR(50) NULL,
  CHANGE COLUMN createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Fix suppliers table
ALTER TABLE suppliers
  CHANGE COLUMN contactPerson contact_person VARCHAR(255) NULL,
  CHANGE COLUMN createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Fix stockTransfers table
ALTER TABLE stockTransfers
  CHANGE COLUMN productId product_id INT NOT NULL,
  CHANGE COLUMN fromLevel from_level ENUM('warehouse','operator','machine') NOT NULL,
  CHANGE COLUMN toLevel to_level ENUM('warehouse','operator','machine') NOT NULL,
  CHANGE COLUMN fromLocationId from_location_id INT NULL,
  CHANGE COLUMN toLocationId to_location_id INT NULL,
  CHANGE COLUMN performedBy performed_by INT NOT NULL,
  CHANGE COLUMN performedByName performed_by_name VARCHAR(255) NULL,
  CHANGE COLUMN createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Fix accessRequests table
ALTER TABLE accessRequests
  CHANGE COLUMN telegramId telegram_id VARCHAR(64) NOT NULL,
  CHANGE COLUMN firstName first_name VARCHAR(255) NULL,
  CHANGE COLUMN lastName last_name VARCHAR(255) NULL,
  CHANGE COLUMN chatId chat_id VARCHAR(64) NOT NULL,
  CHANGE COLUMN requestedRole requested_role ENUM('operator','manager') NOT NULL DEFAULT 'operator',
  CHANGE COLUMN approvedBy approved_by INT NULL,
  CHANGE COLUMN approvedAt approved_at TIMESTAMP NULL,
  CHANGE COLUMN createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHANGE COLUMN adminNotes admin_notes TEXT NULL;

-- Fix accessRequestAuditLogs table
ALTER TABLE accessRequestAuditLogs
  CHANGE COLUMN accessRequestId access_request_id INT NOT NULL,
  CHANGE COLUMN performedBy performed_by INT NOT NULL,
  CHANGE COLUMN performedByName performed_by_name VARCHAR(255) NULL,
  CHANGE COLUMN assignedRole assigned_role ENUM('operator','manager','admin') NULL,
  CHANGE COLUMN createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Fix roleChanges table
ALTER TABLE roleChanges
  CHANGE COLUMN userId user_id INT NOT NULL,
  CHANGE COLUMN oldRole old_role ENUM('operator','manager','admin') NULL,
  CHANGE COLUMN newRole new_role ENUM('operator','manager','admin') NOT NULL,
  CHANGE COLUMN changedBy changed_by INT NOT NULL,
  CHANGE COLUMN changedByName changed_by_name VARCHAR(255) NULL,
  CHANGE COLUMN createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Fix digestConfig table
ALTER TABLE digestConfig
  CHANGE COLUMN createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHANGE COLUMN updatedAt updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Fix users table (if needed)
ALTER TABLE users
  CHANGE COLUMN openId open_id VARCHAR(255) NOT NULL,
  CHANGE COLUMN loginMethod login_method VARCHAR(50) NULL,
  CHANGE COLUMN telegramId telegram_id VARCHAR(64) NULL,
  CHANGE COLUMN passwordHash password_hash VARCHAR(255) NULL,
  CHANGE COLUMN createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHANGE COLUMN updatedAt updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHANGE COLUMN emailNotifications email_notifications BOOLEAN DEFAULT TRUE,
  CHANGE COLUMN telegramNotifications telegram_notifications BOOLEAN DEFAULT TRUE;

-- Fix notifications table
ALTER TABLE notifications
  CHANGE COLUMN userId user_id INT NOT NULL,
  CHANGE COLUMN isRead is_read BOOLEAN DEFAULT FALSE,
  CHANGE COLUMN createdAt created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
