import { connectionDB } from "../config/database";
import { Cart, CartItem, CartItemDetail } from "../interfaces/cart";
import { AppError } from "../utils/appError";

export const addToCart = async(user_id: number, cart_item: CartItem):Promise<void> => {
    const pool = await connectionDB();
    const transaction = await pool.transaction();
    try {
        await transaction.begin();
        const cartResult = await transaction
            .request()
            .input("user_id", user_id)
            .query(`SELECT id FROM carts WHERE user_id = @user_id`);
        
        let cartId: number;
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
        console.log(1);
        const productResult = await transaction
            .request()
            .input("product_id", cart_item.product_id)
            .input("size_id", cart_item.size_id)
            .input("color_id", cart_item.color_id)
            .query(`SELECT ps.stock, pc.color, ps.size
                FROM products p
                JOIN product_colors pc ON p.id = pc.product_id
                JOIN product_sizes ps ON ps.color_id = pc.id
                WHERE p.id = @product_id AND pc.id = @color_id AND ps.id = @size_id`);
        console.log(2);
        if (productResult.recordset.length === 0) {
            throw new AppError("Product not found", 404);
        }
        const stock = productResult.recordset[0].stock;
        if (stock < cart_item.quantity) {
            throw new AppError(`Not enough stock. Available: ${stock}`, 400);
        }
        const itemResult = await transaction
            .request()
            .input("cart_id", cartId)
            .input("product_id", cart_item.product_id)
            .input("color_id", cart_item.color_id)
            .input("size_id", cart_item.size_id)
            .query(`SELECT id, quantity
                FROM cart_items 
                WHERE cart_id = @cart_id AND product_id = @product_id AND color_id = @color_id AND size_id = @size_id
                `)
        
        if (itemResult.recordset.length === 0) {
            await transaction
                .request()
                .input("cart_id", cartId)
                .input("product_id", cart_item.product_id)
                .input("size_id", cart_item.size_id)
                .input("color_id", cart_item.color_id)
                .input("quantity", cart_item.quantity)
                .query(`INSERT INTO cart_items (cart_id, product_id, size_id, color_id, quantity)
                        VALUES (@cart_id, @product_id, @size_id, @color_id, @quantity)`);
        }
        else {
            const newQuantity = itemResult.recordset[0].quantity + cart_item.quantity;
            if (newQuantity > stock) {
                throw new AppError(`Not enough stock. Available: ${stock}`, 400);
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

    } catch (err: any) {
        await transaction.rollback();
        console.error(err);
        if (err instanceof AppError) throw err;
        throw new AppError("Failed to addToCart", 500, false);
    }
}

export const getCartItems = async (user_id: number): Promise<Cart> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
        .input("user_id", user_id)
            .query(`SELECT ci.id, ci.product_id, ci.color_id, ci.size_id, p.name, ci.quantity, ps.price, pc.color, ps.size, pc.image_url, (ci.quantity * ps.price) AS total_price
                FROM carts c
                JOIN cart_items ci ON c.id = ci.cart_id
                JOIN products p ON ci.product_id = p.id
                JOIN product_colors pc ON ci.color_id = pc.id
                JOIN product_sizes ps ON ci.size_id = ps.id
                WHERE c.user_id = @user_id`);
        const items: CartItemDetail[] = result.recordset;
        const total_quantity = items.reduce((sum, item) => sum + item.quantity, 0);
        const total_amount = items.reduce((sum, item) => sum + item.total_price, 0);
        return {
            user_id,
            items,
            total_quantity,
            total_amount
        };
    }
    catch (err: any) {
        console.error(err);
        if (err instanceof AppError) throw err;
        throw new AppError("Failed to getCartItems", 500, false);
    }
}

export const updateCartItemQuantity = async (cart_item_id: number, newQuantity: number): Promise<void> => {
    try {
        const pool = await connectionDB();
        const productResult = await pool.request()
            .input("cart_item_id", cart_item_id)
            .query(`SELECT ps.stock, ci.quantity
                    FROM cart_items ci
                    JOIN product_sizes ps ON ci.size_id = ps.id
                    WHERE ci.id = @cart_item_id`);  
        console.log(productResult.recordset);
        if (productResult.recordset.length === 0) {
            throw new AppError("Cart item not found", 404);
        }
        const stock = productResult.recordset[0].stock;
        if(stock < newQuantity) {
            throw new AppError(`Not enough stock. Available: ${stock}`, 400);
        }
        await pool.request()
            .input("cart_item_id", cart_item_id)
            .input("quantity", newQuantity)
            .query(`UPDATE cart_items
                    SET quantity = @quantity
                    WHERE id = @cart_item_id`);
    } catch (err : any) {
        console.error(err);
        if (err instanceof AppError) throw err;
        throw new AppError("Failed to updateCartItemQuantity", 500, false);
    }
}
export const updateCartItem = async (cart_item_id: number, color_id: number, size_id: number): Promise<void> => {
    try {
        const pool = await connectionDB();
        const productResult = await pool.request()
            .input("color_id", color_id)
            .input("size_id", size_id)
            .query(`SELECT ps.stock
                    FROM product_sizes ps
                    WHERE ps.color_id = @color_id AND ps.id = @size_id`);
        if (productResult.recordset.length === 0) {
            throw new AppError("Product not found", 404);
        }
        const stock = productResult.recordset[0].stock;
        if(stock < 1) {
            throw new AppError(`Not enough stock. Available: ${stock}`, 400);
        }
        await pool.request()
            .input("color_id", color_id)
            .input("size_id", size_id)
            .input("cart_item_id", cart_item_id)
            .query(`UPDATE cart_items
                    SET color_id = @color_id, size_id = @size_id, quantity = 1
                    WHERE id = @cart_item_id`);
    } catch (err : any) {
        console.error(err);
        if (err instanceof AppError) throw err;
        throw new AppError("Failed to updateCartItem", 500, false);
    }
}

export const removeCartItem = async (cart_item_id: number): Promise<void> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input("cart_item_id", cart_item_id)
            .query(`DELETE FROM cart_items WHERE id = @cart_item_id`);
        if (result.rowsAffected[0] === 0) {
            throw new AppError("Cart item not found", 404);
        }
    } catch (err : any) {
        console.error(err);
        if (err instanceof AppError) throw err;
        throw new AppError("Failed to removeCartItem", 500, false);
    }
}

export const clearCart = async (user_id: number): Promise<void> => {
    try {
        const pool = await connectionDB();
        const cartResult = await pool.request()
            .input("user_id", user_id)
            .query(`SELECT id FROM carts WHERE user_id = @user_id`);
        if (cartResult.recordset.length === 0) {
            throw new AppError("Cart not found", 404);
        }
        const cartId = cartResult.recordset[0].id;
        await pool.request()
            .input("cart_id", cartId)
            .query(`DELETE FROM cart_items WHERE cart_id = @cart_id`);
    } catch (err : any) {
        console.error(err);
        if (err instanceof AppError) throw err;
        throw new AppError("Failed to clearCart", 500, false);
    }
}