-- =============================
-- DATABASE
-- =============================

CREATE DATABASE SHOPEEVN;
GO
USE SHOPEEVN;
GO

CREATE TABLE users (    
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE ,
    gender NVARCHAR(10) CHECK ( gender IN ('male', 'female', 'other')) DEFAULT 'other',
    avatar NVARCHAR(255),
    role VARCHAR(20) CHECK (role IN ('customer', 'seller', 'admin')) DEFAULT 'customer',
    status VARCHAR(20) CHECK (status IN ('active','banned')) DEFAULT 'active',
    is_verified BIT DEFAULT 0,   -- 0: chưa xác thực, 1: đã xác thực email/OTP
    created_at DATETIME DEFAULT GETDATE()
);
GO
CREATE TABLE addresses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    name NVARCHAR(255) NOT NULL,
    address NVARCHAR(500) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    is_default BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_ShippingAddresses_Users FOREIGN KEY(user_id)
    REFERENCES Users(id) ON DELETE CASCADE
);
GO

CREATE TABLE shops
(
    id INT IDENTITY(1,1) PRIMARY KEY,
    seller_id INT NOT NULL,
    name NVARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address NVARCHAR(255) NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    cccd VARCHAR(20) NOT NULL,
    description NVARCHAR(255),
    logo NVARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('active','banned')) DEFAULT 'active',
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);
GO
CREATE TABLE shop_visits (
    id INT IDENTITY(1,1) PRIMARY KEY,
    shop_id INT NOT NULL,
    ip_address NVARCHAR(50) NOT NULL,
    visit_date DATE NOT NULL,
    visit_count INT DEFAULT 1
);
GO
CREATE TABLE seller_requests (
    id INT IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address NVARCHAR(255) NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    cccd VARCHAR(20) NOT NULL,
    description NVARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('pending','approved', 'rejected')) DEFAULT 'pending',
    request_date DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

GO

select * from categories
CREATE TABLE categories (
    category_id INT PRIMARY KEY IDENTITY(1,1),
    category_name NVARCHAR(100) NOT NULL,
    description NVARCHAR(255),
    status VARCHAR(50) DEFAULT 'active'
);

GO

CREATE TABLE products
(
    id INT IDENTITY(1,1) PRIMARY KEY,
    shop_id INT NOT NULL,
    category_id INT NOT NULL,
    name NVARCHAR(200) NOT NULL,
    description NVARCHAR(250),
    status VARCHAR(20) CHECK (status IN ('active','hidden','banned')) DEFAULT 'active',
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)

);
GO
CREATE TABLE product_colors
(
    id INT PRIMARY KEY IDENTITY(1,1),
    product_id INT NOT NULL,
    color NVARCHAR(50) NOT NULL,
    image_url NVARCHAR(255) NOT NULL,
    is_main BIT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
GO
CREATE TABLE product_sizes
(
    id INT IDENTITY(1,1) PRIMARY KEY,
    color_id INT NOT NULL,
    size NVARCHAR(50) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (color_id) REFERENCES product_colors(id) ON DELETE CASCADE
);
GO
CREATE TABLE carts
(
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
GO

CREATE TABLE cart_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cart_id INT NOT NULL,
	  color_id INT NOT NULL,
	  size_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,

    FOREIGN KEY (product_id) REFERENCES products(id),
	  FOREIGN KEY (color_id) REFERENCES product_colors(id),
	  FOREIGN KEY (size_id) REFERENCES product_sizes(id)
);
GO
CREATE TABLE vouchers
(
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

CREATE TABLE orders
(
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    voucher_id INT,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending','comfirm','shipped','completed','cancelled')) DEFAULT 'pending',
    shipping_address NVARCHAR(255) NOT NULL,
    shipping_phone NVARCHAR(20) NOT NULL,
    shipping_name NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id)
);
GO
CREATE TABLE order_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    color_id INT NOT NULL,
	  size_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (color_id) REFERENCES product_colors(id),
	FOREIGN KEY (size_id) REFERENCES product_sizes(id)
 );
GO

CREATE TABLE reviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_item INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(250),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

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
CREATE TABLE otp_codes (
    id INT IDENTITY(1,1) PRIMARY KEY,   
    email NVARCHAR(255) NOT NULL,         
    otp NVARCHAR(10) NOT NULL,             
    created_at DATETIME DEFAULT GETDATE(),  
    expires_at DATETIME NOT NULL            
);


-- Tạo 1 shop mẫu
INSERT INTO users (name, email, password, role, status, phone)
VALUES (N'Hải Hoàng', 'seller1@example.com', '123456', 'seller', 'active', 11111111);

INSERT INTO shops (seller_id, name, description, status)
VALUES (1, N'Shop Hải Hoàng', N'Shop chuyên bán quần áo và giày dép', 'active');

-- Tạo 1 category mẫu
INSERT INTO categories (category_name, description)
VALUES (N'Quần áo', N'Danh mục các sản phẩm quần áo');

