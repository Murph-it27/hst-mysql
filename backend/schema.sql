-- Household Stock Tracker database

CREATE DATABASE IF NOT EXISTS household_stock_tracker;

USE household_stock_tracker;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,

  name VARCHAR(255) NOT NULL,
  description TEXT,

  category VARCHAR(80) NOT NULL,

  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(30) NOT NULL DEFAULT 'pcs',
  minimum_stock DECIMAL(10,2) NOT NULL DEFAULT 1,

  expiry_date DATE NULL,

  notes TEXT,
  image_url VARCHAR(500),

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_items_user (user_id),

  CONSTRAINT fk_items_user
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE
);

-- Shopping list table
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,

  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit VARCHAR(30) NOT NULL DEFAULT 'pcs',

  is_purchased BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_shopping_user (user_id),

  CONSTRAINT fk_shopping_user
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE
);
