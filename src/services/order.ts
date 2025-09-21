import { OderPayLoad, Order, OrderItem, GetOrder } from "../interfaces/order"
import { connectionDB } from "../config/database"
import { addAddress } from "./address";
import { AppError } from "../utils/appError"
import { Address } from "../interfaces/address";
import { PaymentData } from "../interfaces/vnpay";
import mssql from 'mssql';


const baseQuery = `SELECT 
                    o.id AS order_id,
                    p.name AS product_name,
                    p.id AS product_id,
                    pc.color,
                    pc.id AS color_id,
                    pc.image_url,
                    ps.size,
                    ps.id AS size_id,
                    oi.quantity,
                    oi.price,
                    oi.id AS item_id,
                    o.status,
                    o.created_at,
                    o.total,
                    pay.method,
                    o.shipping_address,
                    o.shipping_name,
                    o.shipping_phone
                FROM orders o
                    INNER JOIN order_items oi ON oi.order_id = o.id
                    INNER JOIN products p ON oi.product_id = p.id
                    INNER JOIN product_colors pc ON pc.id = oi.color_id
                    INNER JOIN product_sizes ps ON ps.id = oi.size_id
                    INNER JOIN payments pay ON o.id = pay.order_id`; 

const transformationOrder = (result: any[], orderMaps: Record<number, GetOrder>) => {
    result.forEach((row:any) => {
            if(!orderMaps[row.order_id]){
                orderMaps[row.order_id] = {
                    order_id: row.order_id,
                    status: row.status,
                    created_at: row.created_at,
                    items: [],
                    total: row.total,
                    payment_method: row.payment_method,
                    shipping_address: row.shipping_address,
                    shipping_name: row.shipping_name,
                    shipping_phone: row.shipping_phone
                }
            }
            orderMaps[row.order_id].items.push({
                id: row.item_id,
                product_id: row.product_id,
                product_name: row.product_name,
                color_id: row.color_id,
                color: row.color,
                size_id: row.size_id,
                size: row.size,
                quantity: row.quantity,
                price: row.price,
                image_url: row.image_url
            })
        })
} 
export const getOrderOfme = async(user_id: number) : Promise<GetOrder[]> => {
    const query = `${baseQuery}
                WHERE o.user_id = @user_id`;
    try {
        const pool = await connectionDB();
        const result = await pool.request().input('user_id', user_id).query(query);

        const orderMaps :Record<number, GetOrder> = {};
        transformationOrder(result.recordset, orderMaps);
        
        return Object.values(orderMaps);
    } catch (error) {
        console.log(error);
        throw new AppError('Failed to fetching order', 500, false);
    }
}
export const getOrderById = async (order_id: number) : Promise<GetOrder |null> => {
    const query = `${baseQuery}
                    WHERE o.id = @order_id`;
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input('order_id', order_id)
            .query(query);
        const orderMaps : Record<number, GetOrder> = {};
        transformationOrder(result.recordset, orderMaps);
        const orders = Object.values(orderMaps);
        if(!orders){
            return null;
        }
        return orders[0];

    } catch (error) {
        console.log(error);
        throw new AppError(`Failed to fetching order by id ${order_id}`, 500, false);
    }
}
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
export const createOder = async (orderData: OderPayLoad): Promise<PaymentData> => {
    const pool = await connectionDB();
    const transaction = new mssql.Transaction(pool);
    const { order, orderItems } = orderData;
    try {
        await transaction.begin();
        const orderId = await insertOrder(transaction, order);
        await insertOrderItems(transaction, orderId, orderItems);
         
        await insertPayment(transaction, orderId, order.total, order.payment_method, "pending");
        await addAddress({
            user_id: order.user_id,
            name: order.shipping_name,
            phone: order.shipping_phone,
            address: order.shipping_address,
            is_default: false
        })
        await transaction.commit();
        return { order_id: orderId, amount: order.total };
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        throw new AppError('Failed to create order', 500, false);
    }
}
export const updateAdressOrder = async (order_id: number, address: Address) : Promise<void> => {
    const query = `UPDATE orders 
            SET shipping_address = @address,
                shipping_phone = @phone,
                shipping_name = @name
            WHERE id = @id`
    try {
        const pool = await connectionDB();
        await pool.request()
            .input('id', order_id)
            .input('address', address.address)
            .input('phone', address.phone)
            .input('name', address.name)
            .query(query);
    } catch (error) {
        console.log(error);
        throw new AppError('Failed to update address', 500, false);
    }
}

export const updateStatusOrder = async (order_id: number, status: string) : Promise<void> => {
    const query = `UPDATE orders SET status = @status WHERE id = @id`;
    try {
        const pool = await connectionDB();
        await pool.request()
            .input('id', order_id)
            .input('status', status)
            .query(query);
    } catch (error) {
        console.log(error);
        throw new AppError('Failed to confirm order', 500, false);
    }
}