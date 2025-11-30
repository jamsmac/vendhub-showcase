-- Reference Books Schema Extension
-- Adds comprehensive справочники (reference books) support

-- ============================================================================
-- LOCATIONS TABLE (Локации/Места установки)
-- ============================================================================

CREATE TABLE IF NOT EXISTS locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  type ENUM('office', 'retail', 'transport', 'education', 'food_court', 'other') DEFAULT 'other',
  address TEXT,
  city VARCHAR(100),
  region VARCHAR(100),
  postalCode VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  contactPerson VARCHAR(255),
  contactPhone VARCHAR(20),
  contactEmail VARCHAR(320),
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  machineCount INT DEFAULT 0,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdBy INT,
  updatedBy INT,
  INDEX idx_locations_type (type),
  INDEX idx_locations_status (status),
  INDEX idx_locations_city (city),
  INDEX idx_locations_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CATEGORIES TABLE (Категории товаров)
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  parentCategoryId INT,
  icon VARCHAR(100),
  color VARCHAR(7),
  sortOrder INT DEFAULT 0,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdBy INT,
  updatedBy INT,
  INDEX idx_categories_parent (parentCategoryId),
  INDEX idx_categories_status (status),
  FOREIGN KEY (parentCategoryId) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- UNITS TABLE (Единицы измерения)
-- ============================================================================

CREATE TABLE IF NOT EXISTS units (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  shortName VARCHAR(10) NOT NULL UNIQUE,
  description TEXT,
  type ENUM('weight', 'volume', 'quantity', 'length', 'area', 'other') DEFAULT 'quantity',
  status ENUM('active', 'inactive') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_units_type (type),
  INDEX idx_units_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default units
INSERT IGNORE INTO units (name, shortName, type) VALUES
('Килограмм', 'кг', 'weight'),
('Литр', 'л', 'volume'),
('Штука', 'шт', 'quantity'),
('Метр', 'м', 'length'),
('Грамм', 'г', 'weight'),
('Миллилитр', 'мл', 'volume'),
('Упаковка', 'уп', 'quantity');

-- ============================================================================
-- MACHINE TYPES TABLE (Типы аппаратов)
-- ============================================================================

CREATE TABLE IF NOT EXISTS machineTypes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  manufacturer VARCHAR(255),
  capacity INT,
  dimensions VARCHAR(100),
  weight INT,
  powerConsumption INT,
  coolingCapacity INT,
  supportedProducts ENUM('beverages', 'snacks', 'both', 'hot_drinks') DEFAULT 'both',
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdBy INT,
  updatedBy INT,
  INDEX idx_machineTypes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- COMPONENT TYPES TABLE (Типы компонентов)
-- ============================================================================

CREATE TABLE IF NOT EXISTS componentTypes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100),
  manufacturer VARCHAR(255),
  averageLifespan INT COMMENT 'in days',
  warrantyPeriod INT COMMENT 'in days',
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdBy INT,
  updatedBy INT,
  INDEX idx_componentTypes_category (category),
  INDEX idx_componentTypes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TASK TYPES TABLE (Типы задач)
-- ============================================================================

CREATE TABLE IF NOT EXISTS taskTypes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  estimatedDuration INT COMMENT 'in minutes',
  priority ENUM('low', 'normal', 'urgent') DEFAULT 'normal',
  requiresPhoto BOOLEAN DEFAULT false,
  requiresApproval BOOLEAN DEFAULT false,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdBy INT,
  updatedBy INT,
  INDEX idx_taskTypes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default task types
INSERT IGNORE INTO taskTypes (name, description, estimatedDuration, requiresPhoto) VALUES
('Пополнение', 'Пополнение товаров в аппарате', 30, true),
('Техническое обслуживание', 'Плановое техническое обслуживание', 60, true),
('Чистка', 'Чистка и дезинфекция аппарата', 45, true),
('Осмотр', 'Визуальный осмотр состояния', 15, false),
('Ремонт', 'Ремонт неисправности', 120, true);

-- ============================================================================
-- SUPPLIER TYPES TABLE (Типы поставщиков)
-- ============================================================================

CREATE TABLE IF NOT EXISTS supplierTypes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_supplierTypes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default supplier types
INSERT IGNORE INTO supplierTypes (name, description) VALUES
('Производитель', 'Прямой производитель товаров'),
('Дистрибьютор', 'Оптовый дистрибьютор'),
('Розничный поставщик', 'Розничный поставщик'),
('Логистический партнер', 'Логистический партнер'),
('Сервисный центр', 'Сервисный центр оборудования');

-- ============================================================================
-- ENHANCE EXISTING TABLES
-- ============================================================================

-- Add missing columns to machines table
ALTER TABLE machines ADD COLUMN IF NOT EXISTS locationId INT;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS machineTypeId INT;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS totalRevenue DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS totalSales INT DEFAULT 0;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS photo VARCHAR(255);
ALTER TABLE machines ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS createdBy INT;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS updatedBy INT;
ALTER TABLE machines ADD INDEX IF NOT EXISTS idx_machines_location (locationId);
ALTER TABLE machines ADD INDEX IF NOT EXISTS idx_machines_type (machineTypeId);
ALTER TABLE machines ADD INDEX IF NOT EXISTS idx_machines_status (status);

-- Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS categoryId INT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unitId INT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive', 'archived') DEFAULT 'active';
ALTER TABLE products ADD COLUMN IF NOT EXISTS createdBy INT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updatedBy INT;
ALTER TABLE products ADD INDEX IF NOT EXISTS idx_products_category (categoryId);
ALTER TABLE products ADD INDEX IF NOT EXISTS idx_products_unit (unitId);
ALTER TABLE products ADD INDEX IF NOT EXISTS idx_products_status (status);

-- Add missing columns to suppliers table
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS type VARCHAR(100);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS bankAccount VARCHAR(100);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS taxId VARCHAR(100);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive', 'archived') DEFAULT 'active';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS createdBy INT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS updatedBy INT;
ALTER TABLE suppliers ADD INDEX IF NOT EXISTS idx_suppliers_status (status);

-- Add missing columns to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS taskTypeId INT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS locationId INT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS dueDate TIMESTAMP;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completedBy INT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS createdBy INT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updatedBy INT;
ALTER TABLE tasks ADD INDEX IF NOT EXISTS idx_tasks_type (taskTypeId);
ALTER TABLE tasks ADD INDEX IF NOT EXISTS idx_tasks_location (locationId);
ALTER TABLE tasks ADD INDEX IF NOT EXISTS idx_tasks_status (status);

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

ALTER TABLE machines ADD CONSTRAINT fk_machines_location 
  FOREIGN KEY (locationId) REFERENCES locations(id) ON DELETE SET NULL;

ALTER TABLE machines ADD CONSTRAINT fk_machines_type 
  FOREIGN KEY (machineTypeId) REFERENCES machineTypes(id) ON DELETE SET NULL;

ALTER TABLE products ADD CONSTRAINT fk_products_category 
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL;

ALTER TABLE products ADD CONSTRAINT fk_products_unit 
  FOREIGN KEY (unitId) REFERENCES units(id) ON DELETE SET NULL;

ALTER TABLE tasks ADD CONSTRAINT fk_tasks_type 
  FOREIGN KEY (taskTypeId) REFERENCES taskTypes(id) ON DELETE SET NULL;

ALTER TABLE tasks ADD CONSTRAINT fk_tasks_location 
  FOREIGN KEY (locationId) REFERENCES locations(id) ON DELETE SET NULL;

-- ============================================================================
-- AUDIT TRAIL FOR REFERENCE BOOKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS referenceBookAuditLog (
  id INT PRIMARY KEY AUTO_INCREMENT,
  entityType ENUM('location', 'category', 'unit', 'machineType', 'componentType', 'taskType', 'supplierType') NOT NULL,
  entityId INT NOT NULL,
  action ENUM('created', 'updated', 'deleted', 'archived') NOT NULL,
  oldValues JSON,
  newValues JSON,
  performedBy INT,
  performedByName VARCHAR(255),
  reason TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_entity (entityType, entityId),
  INDEX idx_audit_action (action),
  INDEX idx_audit_date (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_machines_created ON machines(createdAt);
CREATE INDEX idx_machines_updated ON machines(updatedAt);
CREATE INDEX idx_products_created ON products(createdAt);
CREATE INDEX idx_products_updated ON products(updatedAt);
CREATE INDEX idx_suppliers_created ON suppliers(createdAt);
CREATE INDEX idx_suppliers_updated ON suppliers(updatedAt);
CREATE INDEX idx_tasks_created ON tasks(createdAt);
CREATE INDEX idx_tasks_updated ON tasks(updatedAt);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

CREATE OR REPLACE VIEW v_machines_with_details AS
SELECT 
  m.id,
  m.name,
  m.serialNumber,
  m.model,
  m.status,
  l.name as locationName,
  l.city,
  mt.name as machineTypeName,
  m.totalRevenue,
  m.totalSales,
  m.lastMaintenance,
  m.nextServiceDue,
  m.createdAt,
  m.updatedAt
FROM machines m
LEFT JOIN locations l ON m.locationId = l.id
LEFT JOIN machineTypes mt ON m.machineTypeId = mt.id
WHERE m.status != 'archived';

CREATE OR REPLACE VIEW v_products_with_details AS
SELECT 
  p.id,
  p.name,
  p.sku,
  p.category,
  c.name as categoryName,
  u.shortName as unitName,
  p.costPrice,
  p.sellingPrice,
  ROUND((p.sellingPrice - p.costPrice) / p.costPrice * 100, 2) as profitMargin,
  p.status,
  p.createdAt,
  p.updatedAt
FROM products p
LEFT JOIN categories c ON p.categoryId = c.id
LEFT JOIN units u ON p.unitId = u.id
WHERE p.status != 'archived';

CREATE OR REPLACE VIEW v_suppliers_with_stats AS
SELECT 
  s.id,
  s.name,
  s.type,
  s.contactPerson,
  s.email,
  s.phone,
  s.status,
  s.rating,
  COUNT(DISTINCT p.id) as productCount,
  s.createdAt
FROM suppliers s
LEFT JOIN products p ON p.supplier = s.name
WHERE s.status != 'archived'
GROUP BY s.id;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

DELIMITER $$

-- Get machine statistics
CREATE PROCEDURE IF NOT EXISTS sp_get_machine_stats(IN p_locationId INT)
BEGIN
  SELECT 
    COUNT(*) as totalMachines,
    SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as onlineMachines,
    SUM(CASE WHEN status = 'offline' THEN 1 ELSE 0 END) as offlineMachines,
    SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenanceMachines,
    SUM(totalRevenue) as totalRevenue,
    AVG(totalRevenue) as avgRevenue
  FROM machines
  WHERE (p_locationId IS NULL OR locationId = p_locationId)
    AND status != 'archived';
END$$

-- Get product inventory value
CREATE PROCEDURE IF NOT EXISTS sp_get_inventory_value()
BEGIN
  SELECT 
    p.id,
    p.name,
    p.costPrice,
    SUM(i.quantity) as totalQuantity,
    (p.costPrice * SUM(i.quantity)) as inventoryValue
  FROM products p
  LEFT JOIN inventory i ON p.id = i.productId
  WHERE p.status = 'active'
  GROUP BY p.id
  ORDER BY inventoryValue DESC;
END$$

DELIMITER ;

-- ============================================================================
-- SAMPLE DATA (Optional - for development)
-- ============================================================================

INSERT IGNORE INTO locations (name, type, city, address, status) VALUES
('Центральный вокзал', 'transport', 'Ташкент', 'Ул. Амира Тимура, 1', 'active'),
('Технопарк', 'office', 'Ташкент', 'Ул. Ойбека, 56', 'active'),
('ТЦ Глобус', 'retail', 'Ташкент', 'Ул. Мирзо Улугбека, 45', 'active'),
('Университет', 'education', 'Ташкент', 'Ул. Университетская, 4', 'active'),
('Аэропорт', 'transport', 'Ташкент', 'Аэропорт Мирабад', 'active');

INSERT IGNORE INTO machineTypes (name, description, capacity, supportedProducts, status) VALUES
('VendMaster 3000', 'Универсальный аппарат для напитков и снеков', 500, 'both', 'active'),
('CoolBox Pro', 'Холодильный аппарат для напитков', 300, 'beverages', 'active'),
('HotDrink Express', 'Аппарат горячих напитков', 200, 'hot_drinks', 'active'),
('SnackMaster', 'Аппарат для снеков', 400, 'snacks', 'active');

INSERT IGNORE INTO categories (name, description, status) VALUES
('Напитки', 'Безалкогольные напитки', 'active'),
('Снеки', 'Закуски и снеки', 'active'),
('Горячие напитки', 'Кофе, чай, какао', 'active'),
('Молочные продукты', 'Молоко, йогурты', 'active'),
('Сладости', 'Конфеты, печенье, шоколад', 'active');

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
