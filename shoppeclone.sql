-- =============================
-- DATABASE
-- =============================

CREATE DATABASE SHOPEE;
GO
USE SHOPEE;
GO

-- =============================
-- BẢNG NGƯỜI DÙNG
-- =============================
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('customer', 'seller', 'admin')) DEFAULT 'customer',
    status VARCHAR(20) CHECK (status IN ('active','banned')) DEFAULT 'active',
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- =============================
-- BẢNG SHOP (chỉ dành cho seller)
-- =============================
CREATE TABLE shops (
    id INT IDENTITY(1,1) PRIMARY KEY,
    seller_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('active','banned')) DEFAULT 'active',
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);
GO

-- =============================
-- BẢNG SẢN PHẨM
-- =============================
CREATE TABLE products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    shop_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('active','hidden','banned')) DEFAULT 'active',
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);
GO

-- =============================
-- BẢNG GIỎ HÀNG
-- =============================
CREATE TABLE carts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
GO

CREATE TABLE cart_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) 
);
GO

-- =============================
-- BẢNG ĐƠN HÀNG
-- =============================
CREATE TABLE orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending','paid','shipped','completed','cancelled')) DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
GO

CREATE TABLE order_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) 
);
GO

-- =============================
-- BẢNG ĐÁNH GIÁ
-- =============================
CREATE TABLE reviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

-- =============================
-- BẢNG THANH TOÁN
-- =============================
CREATE TABLE payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    method VARCHAR(20) CHECK (method IN ('cod','credit_card','paypal','momo')) DEFAULT 'cod',
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending','success','failed')) DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
GO

-- =============================
-- BẢNG VOUCHER
-- =============================
CREATE TABLE vouchers (
    id INT PRIMARY KEY IDENTITY(1,1),
    code NVARCHAR(50) UNIQUE NOT NULL,
    description NVARCHAR(255),
    discount_type NVARCHAR(20) CHECK (discount_type IN ('PERCENT', 'FIXED')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_value DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2),
    quantity INT NOT NULL,
    used INT DEFAULT 0,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    created_by INT, 
    scope NVARCHAR(20) CHECK (scope IN ('GLOBAL','SHOP')) NOT NULL,
    shop_id INT NULL FOREIGN KEY REFERENCES shops(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
GO

CREATE TABLE user_vouchers (
    id INT PRIMARY KEY IDENTITY(1,1),
    voucher_id INT FOREIGN KEY REFERENCES vouchers(id),
    user_id INT FOREIGN KEY REFERENCES users(id),
    used_date DATETIME
);
GO

-- =============================
-- BẢNG FLASH SALE
-- =============================
CREATE TABLE flash_sales (
    id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(100),
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    created_by INT FOREIGN KEY REFERENCES users(id)
);
GO

CREATE TABLE flash_sale_items (
    id INT PRIMARY KEY IDENTITY(1,1),
    flash_sale_id INT FOREIGN KEY REFERENCES flash_sales(id),
    product_id INT FOREIGN KEY REFERENCES products(id),
    flash_price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    sold INT DEFAULT 0
);
GO
