import { createOderPayLoad, Order, OrderItem } from "../interfaces/order"
import { connectionDB } from "../config/database"
import { AppError } from "../utils/appError"
import mssql from 'mssql';

const insertOrder = async (transaction: mssql.Transaction, order: Order): Promise<number> => {
    const query = `INSERT INTO orders (user_id, total, shipping_name, shipping_address, shipping_phone)
                   OUTPUT INSERTED.id AS orderId
                   VALUES (@user_id, @total, @shipping_name, @shipping_address, @shipping_phone)`;
    const result = await new mssql.Request(transaction)
        .input('user_id', order.user_id)
        .input('total', order.total)
        .input('status', order.status)
        .input('shipping_name', order.shipping_name)
        .input('shipping_address', order.shipping_address)
        .input('shipping_phone', order.shipping_phone)
        .query(query);
    return result.recordset[0].orderId;
}
const insertOrderItems = async (transaction: mssql.Transaction, orderId: number, orderItems: OrderItem[]): Promise<void> => {
    const query = `INSERT INTO order_items (order_id, product_id, color_id, size_id, quantity, price)
                   VALUES (@order_id, @product_id, @color_id, @size_id, @quantity, @price)`;
    for (const item of orderItems) {
        await new mssql.Request(transaction)
            .input('order_id', orderId)
            .input('product_id', item.product_id)
            .input('color_id', item.color_id)
            .input('size_id', item.size_id)
            .input('quantity', item.quantity)
            .input('price', item.price)
            .query(query);
        await updateProductStock(transaction, item.size_id, item.quantity);
    }
}
const updateProductStock = async (transaction: mssql.Transaction, size_id: number, quantity: number): Promise<void> => {
    const query = `UPDATE product_sizes
                   SET stock = stock - @quantity
                   WHERE id = @size_id AND stock >= @quantity`;
    await new mssql.Request(transaction)
        .input('size_id', size_id)
        .input('quantity', quantity)
        .query(query);
}
const insertPayment = async (transaction: mssql.Transaction, orderId: number, amount: number, method: string, status: string): Promise<void> => {
    const query = `INSERT INTO payments (order_id, amount, method, status)
                   VALUES (@order_id, @amount, @method, @status)`;
    await new mssql.Request(transaction)
        .input('order_id', orderId)
        .input('amount', amount)
        .input('method', method)
        .input('status', status)
        .query(query);
}
export const createOder = async (orderData: createOderPayLoad, statusPayment: string): Promise<void> => {
    const pool = await connectionDB();
    const transaction = new mssql.Transaction(pool);
    const { order, orderItems } = orderData;
    try {
        await transaction.begin();
        const orderId = await insertOrder(transaction, order);
        await insertOrderItems(transaction, orderId, orderItems);
        await insertPayment(transaction, orderId, order.total, order.payment_method, statusPayment);
        await transaction.commit();
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        throw new AppError('Failed to create order', 500, false);
    }
}