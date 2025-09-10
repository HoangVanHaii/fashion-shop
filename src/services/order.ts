import { createOderPayLoad } from "../interfaces/order"
import { connectionDB } from "../config/database"
import mssql from 'mssql';
export const createOder = async (orderData: createOderPayLoad, statusPayment: string) : Promise<void> => {
    const pool = await connectionDB();
    const transaction = new mssql.Transaction(pool)
    const { order, orderItems } = orderData;
    try {
        await transaction.begin();
        
        const queryInserOrder = `INSERT INTO orders (user_id, total, shipping_name, shipping_address, shipping_phone, status)
                                OUTPUT INSERTED.id AS orderId
                                VALUES (@user_id, @total, @shipping_name, @shipping_address, @shipping_phone, @status)`;
        
        const insertOrder = await new mssql.Request(transaction)
            .input('user_id', order.user_id)
            .input('total', order.total)
            .input('status', order.status)
            .input('shipping_name', order.shipping_name)
            .input('shipping_address', order.shipping_address)
            .input('shipping_phone', order.shipping_phone)
            .query(queryInserOrder);

        const orderId = insertOrder.recordset[0].orderId;   
        const queryInsertOrderItem = `INSERT INTO order_items (order_id, product_id, quantity, price)
                                    VALUES (@order_id, @product_id, @quantity, @price)`;
        const queryUpdateProductStock = `UPDATE products
                                    SET stock = stock - @quantity
                                    WHERE id = @product_id AND stock >= @quantity`;
        for(const item of orderItems){
            await new mssql.Request(transaction)
                .input('order_id', orderId)
                .input('product_id', item.product_id)
                .input('quantity', item.quantity)
                .input('price', item.price)
                .query(queryInsertOrderItem);
            await new mssql.Request(transaction)
                .input('product_id', item.product_id)
                .input('quantity', item.quantity)
                .query(queryUpdateProductStock);
        }
        //insert payment 
        const queryInsertPayment = `INSERT INTO payments (order_id, amount, method, status)
                                    VALUES (@order_id, @amount, @method, @status)`;

        await new mssql.Request(transaction)
            .input('order_id', orderId)
            .input('amount', order.total)
            .input('method', order.payment_method)
            .input('status', statusPayment )
            .query(queryInsertPayment);

        await transaction.commit();
    } catch (error: any) {
        await transaction.rollback();
        throw error;
    }
}