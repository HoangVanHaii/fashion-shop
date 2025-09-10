import { connectionDB } from "../config/database";
import { Cart, CartItem, CartItemDetail } from "../interfaces/cart";

export const addToCart = async(user_id: number, product_id: number, quantity: number):Promise<void> => {
    const pool = await connectionDB();
    const transaction = await pool.transaction();
    try {
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

        const productResult = await transaction
            .request()
            .input("id", product_id)
            .query(`SELECT stock FROM product WHERE id = @id`);
        if (productResult.recordset.length === 0) {
            throw { status: 404, message: "Product not found" };
        }
        const stock = productResult.recordset[0].stock;
        if (stock < quantity) {
            throw { status: 400, message: "Not enough stock" };
        }
        const itemResult = await transaction
            .request()
            .input("cart_id", cartId)
            .input("product_id", product_id)
            .query(`SELECT id, quantity FROM cart_items
                WHERE cart_id = @cart_id AND product_id = @product_id`);
        if (itemResult.recordset.length === 0) {
            const insertResult = await transaction
                .request()
                .input("cart_id", cartId)
                .input("product_id", product_id)
                .input("quantity", quantity)
                .query(`INSERT INTO cart_items (cart_id, product_id, quantity)
                        VALUES (@cart_id, @product_id, @quantity)`);
        }
        else {
            const newQuantity = itemResult.recordset[0].quantity + quantity;
            if (newQuantity > stock) {
                throw { status: 400, message: "Not enough stock" };
            }
            await transaction
                .request()
                .input("id", itemResult.recordset[0].id)
                .input("quantity", newQuantity)
                .query(`UPDATE cart_item 
                    SET quantity = @quantity
                    WHERE id = @id`);
        }
        await transaction.commit();

    } catch (err: any) {
        await transaction.rollback();
        throw err;
        
    }
}
// export const deleteCartId = async