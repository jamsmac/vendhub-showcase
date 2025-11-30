-- Comprehensive Dictionary System for VendHub Manager
-- 50+ Reference Books with Multilingual Support

CREATE TABLE IF NOT EXISTS dictionaries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  name_ru VARCHAR(255),
  name_uz VARCHAR(255),
  description TEXT,
  category VARCHAR(50),
  is_system BOOLEAN DEFAULT true,
  is_editable BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdBy INT,
  updatedBy INT,
  INDEX idx_code (code),
  INDEX idx_category (category),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dictionary_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dictionaryId INT NOT NULL,
  code VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  name_ru VARCHAR(255),
  name_uz VARCHAR(255),
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  symbol VARCHAR(10),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dictionaryId) REFERENCES dictionaries(id) ON DELETE CASCADE,
  UNIQUE KEY unique_dict_code (dictionaryId, code),
  INDEX idx_dictionary (dictionaryId),
  INDEX idx_code (code),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for performance
CREATE INDEX idx_dict_items_active ON dictionary_items(is_active, dictionaryId);
CREATE INDEX idx_dict_items_code ON dictionary_items(code, dictionaryId);
