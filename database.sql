-- Inventory Management System Database Schema

-- Create Database
CREATE DATABASE IF NOT EXISTS inventory_management;
USE inventory_management;

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role ENUM('admin', 'manager', 'staff') NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Inventory Items Table
CREATE TABLE IF NOT EXISTS inventory_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id INT,
    quantity INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2) NOT NULL,
    reorder_level INT NOT NULL DEFAULT 10,
    location VARCHAR(100),
    status ENUM('available', 'low_stock', 'out_of_stock', 'discontinued') DEFAULT 'available',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Create Inventory Transactions Table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    user_id INT,
    transaction_type ENUM('purchase', 'sale', 'adjustment', 'return') NOT NULL,
    quantity INT NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (item_id) REFERENCES inventory_items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Insert sample data for testing
INSERT INTO users (username, password, email, first_name, last_name, role) 
VALUES ('admin', '$2y$10$8MvKBMQDTmHtqE4vFGvXru.mXKRhv9W5MQ.rzmYEKJ0SYe6JRnS3W', 'admin@example.com', 'Admin', 'User', 'admin');

INSERT INTO categories (name, description) 
VALUES 
('Electronics', 'Electronic items and gadgets'),
('Office Supplies', 'Office stationery and supplies'),
('Furniture', 'Office and home furniture');

INSERT INTO inventory_items (name, description, category_id, quantity, unit_price, reorder_level, location, status, created_by) 
VALUES 
('Laptop', 'Dell XPS 13 laptop', 1, 25, 1200.00, 5, 'Warehouse A', 'available', 1),
('Printer Paper', 'A4 size printer paper, 500 sheets', 2, 100, 5.99, 20, 'Warehouse B', 'available', 1),
('Office Chair', 'Ergonomic office chair', 3, 15, 149.99, 3, 'Warehouse C', 'available', 1),
('Pencils', 'HB pencils pack of 12', 2, 50, 2.99, 10, 'Warehouse B', 'available', 1),
('Monitor', '24-inch LCD monitor', 1, 12, 199.99, 3, 'Warehouse A', 'available', 1);