"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeCartItem = exports.updateCartItem = exports.getProductIdBySizeId = exports.updateCartItemQuantity = exports.getCartItems = exports.addToCart = exports.countCartItems = void 0;
const database_1 = require("../config/database");
const appError_1 = require("../utils/appError");
const countCartItems = async (user_id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const result = await pool.request()
            .input("user_id", user_id)
            .query(`
                SELECT ci.id
                FROM carts c
                JOIN cart_items ci ON c.id = ci.cart_id
                WHERE c.user_id = @user_id
                GROUP BY ci.id
            `);
        return Number(result.recordset.length);
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            throw err;
        console.error(err);
        throw new appError_1.AppError("Failed to countCartItems", 500, false);
    }
};
exports.countCartItems = countCartItems;
const addToCart = async (user_id, cart_item) => {
    const pool = await (0, database_1.connectionDB)();
    const transaction = await pool.transaction();
    try {
        await transaction.begin();
        const cartResult = await transaction
            .request()
            .input("user_id", user_id)
            .query(`SELECT id FROM carts WHERE user_id = @user_id`);
        let cartId;
        if (cartResult.recordset.length === 0) {
            const newCart = await transaction
                .request()
                .input("user_id", user_id)
                .query(`INSERT INTO carts (user_id)
                    OUTPUT INSERTED.id VALUES (@user_id)
                    `);
            cartId = newCart.recordset[0].id;
        }
        else {
            cartId = cartResult.recordset[0].id;
        }
        const productResult = await transaction
            .request()
            .input("size_id", cart_item.size_id)
            .query(`SELECT ps.stock, pc.color, ps.size
                FROM product_sizes ps
                JOIN product_colors pc ON ps.color_id = pc.id
                JOIN products p ON pc.product_id = p.id
                WHERE ps.id = @size_id`);
        if (productResult.recordset.length === 0) {
            throw new appError_1.AppError("Product not found", 404);
        }
        const stock = productResult.recordset[0].stock;
        if (stock < cart_item.quantity) {
            throw new appError_1.AppError(`Not enough stock. Available: ${stock}`, 400);
        }
        const itemResult = await transaction
            .request()
            .input("cart_id", cartId)
            .input("size_id", cart_item.size_id)
            .query(`SELECT id, quantity
                FROM cart_items 
                WHERE cart_id = @cart_id AND size_id = @size_id
                `);
        if (itemResult.recordset.length === 0) {
            await transaction
                .request()
                .input("cart_id", cartId)
                .input("size_id", cart_item.size_id)
                .input("quantity", cart_item.quantity)
                .query(`INSERT INTO cart_items (cart_id, size_id, quantity)
                        VALUES (@cart_id, @size_id, @quantity)`);
        }
        else {
            const newQuantity = itemResult.recordset[0].quantity + cart_item.quantity;
            if (newQuantity > stock) {
                throw new appError_1.AppError(`your cart count is full size`, 400);
            }
            await transaction
                .request()
                .input("id", itemResult.recordset[0].id)
                .input("quantity", newQuantity)
                .query(`UPDATE cart_items
                    SET quantity = @quantity
                    WHERE id = @id`);
        }
        await transaction.commit();
    }
    catch (err) {
        await transaction.rollback();
        if (err instanceof appError_1.AppError)
            throw err;
        console.error(err);
        throw new appError_1.AppError("Failed to addToCart", 500, false);
    }
};
exports.addToCart = addToCart;
const getCartItems = async (user_id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const result = await pool.request()
            .input("user_id", user_id)
            .query(`SELECT ci.id, ci.size_id, s.id as shop_id, s.name as shop_name,
                     p.name, ci.quantity, ps.price, pc.color, ISNULL(fsi.flash_sale_price, ps.price) as price_after_reduction,
                    ps.size, pc.image_url, (ci.quantity * ISNULL(fsi.flash_sale_price, ps.price)) AS total_price
                FROM carts c
                    JOIN cart_items ci ON c.id = ci.cart_id
                    JOIN product_sizes ps ON ci.size_id = ps.id
                    JOIN product_colors pc ON ps.color_id = pc.id
                    JOIN products p ON pc.product_id = p.id
                    JOIN shops s ON s.id = p.shop_id
                    LEFT JOIN flash_sale_items fsi ON fsi.size_id = ps.id AND fsi.status = 'active'
                    LEFT JOIN flash_sales fs ON fs.id = fsi.flash_sale_id AND fs.status = 'active'
                WHERE c.user_id = @user_id  
                ORDER BY ci.id DESC
                `);
        const items = result.recordset;
        const ShopCartMap = new Map();
        result.recordset.forEach(element => {
            if (!ShopCartMap.has(element.shop_id)) {
                ShopCartMap.set(element.shop_id, {
                    shop_id: element.shop_id,
                    shop_name: element.shop_name,
                    carts: []
                });
            }
            if (element.id) {
                const cartItem = {
                    cart_item_id: element.id,
                    size_id: element.size_id,
                    name: element.name,
                    quantity: element.quantity,
                    price: element.price,
                    price_after_reduction: element.price_after_reduction,
                    size: element.size,
                    color: element.color,
                    image_url: element.image_url,
                    total_price: element.total_price
                };
                const ShopCart = ShopCartMap.get(element.shop_id);
                if (ShopCart) {
                    ShopCart.carts.push(cartItem);
                }
            }
        });
        const total_quantity = items.reduce((sum, item) => sum + item.quantity, 0);
        const total_amount = items.reduce((sum, item) => sum + item.total_price, 0);
        const carts = {
            shops: Array.from(ShopCartMap.values()),
            total_quantity,
            total_amount
        };
        return carts;
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            throw err;
        console.error(err);
        throw new appError_1.AppError("Failed to getCartItems", 500, false);
    }
};
exports.getCartItems = getCartItems;
const updateCartItemQuantity = async (cart_item_id, newQuantity) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const productResult = await pool.request()
            .input("cart_item_id", cart_item_id)
            .query(`SELECT ps.stock, ci.quantity
                    FROM cart_items ci
                    JOIN product_sizes ps ON ci.size_id = ps.id
                    WHERE ci.id = @cart_item_id`);
        if (productResult.recordset.length === 0) {
            throw new appError_1.AppError("Cart item not found", 404);
        }
        const stock = productResult.recordset[0].stock;
        if (stock < newQuantity) {
            throw new appError_1.AppError(`Not enough stock. Available: ${stock}`, 400);
        }
        await pool.request()
            .input("cart_item_id", cart_item_id)
            .input("quantity", newQuantity)
            .query(`UPDATE cart_items
                    SET quantity = @quantity
                    WHERE id = @cart_item_id`);
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            throw err;
        console.error(err);
        throw new appError_1.AppError("Failed to updateCartItemQuantity", 500, false);
    }
};
exports.updateCartItemQuantity = updateCartItemQuantity;
const getProductIdBySizeId = async (size_id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const productResult = await pool.request()
            .input("size_id", size_id)
            .query(`SELECT p.id
            FROM product_sizes ps
                JOIN product_colors pc ON ps.color_id = pc.id
                JOIN products p ON pc.product_id = p.id
            WHERE ps.id = @size_id`);
        return productResult.recordset[0].id;
    }
    catch (err) {
        throw new appError_1.AppError("Failed to fetchProductIdBySizeId", 500, false);
    }
};
exports.getProductIdBySizeId = getProductIdBySizeId;
const updateCartItem = async (cart_item_id, size_id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const productResult = await pool.request()
            .input("size_id", size_id)
            .query(`SELECT ps.stock
                    FROM product_sizes ps
                    WHERE ps.id = @size_id`);
        const lastSizeId = await pool.request()
            .input("id", cart_item_id)
            .query(`SELECT size_id FROM cart_items WHERE id = @id`);
        const newProductId = await (0, exports.getProductIdBySizeId)(size_id);
        const lastProductId = await (0, exports.getProductIdBySizeId)(lastSizeId.recordset[0].size_id);
        if (newProductId !== lastProductId) {
            throw new appError_1.AppError("Invalid SizeId", 404);
        }
        if (productResult.recordset.length === 0) {
            throw new appError_1.AppError("Product not found", 404);
        }
        const stock = productResult.recordset[0].stock;
        if (stock < 1) {
            throw new appError_1.AppError(`Not enough stock. Available: ${stock}`, 400);
        }
        await pool.request()
            .input("size_id", size_id)
            .input("cart_item_id", cart_item_id)
            .query(`UPDATE cart_items
                    SET size_id = @size_id, quantity = 1
                    WHERE id = @cart_item_id`);
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            throw err;
        console.error(err);
        throw new appError_1.AppError("Failed to updateCartItem", 500, false);
    }
};
exports.updateCartItem = updateCartItem;
const removeCartItem = async (cart_item_id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const result = await pool.request()
            .input("cart_item_id", cart_item_id)
            .query(`DELETE FROM cart_items WHERE id = @cart_item_id`);
        if (result.rowsAffected[0] === 0) {
            throw new appError_1.AppError("Cart item not found", 404);
        }
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            throw err;
        console.error(err);
        throw new appError_1.AppError("Failed to removeCartItem", 500, false);
    }
};
exports.removeCartItem = removeCartItem;
const clearCart = async (user_id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const cartResult = await pool.request()
            .input("user_id", user_id)
            .query(`SELECT id FROM carts WHERE user_id = @user_id`);
        if (cartResult.recordset.length === 0) {
            throw new appError_1.AppError("Cart not found", 404);
        }
        const cartId = cartResult.recordset[0].id;
        await pool.request()
            .input("cart_id", cartId)
            .query(`DELETE FROM cart_items WHERE cart_id = @cart_id`);
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            throw err;
        console.error(err);
        throw new appError_1.AppError("Failed to clearCart", 500, false);
    }
};
exports.clearCart = clearCart;
