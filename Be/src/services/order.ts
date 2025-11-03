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
                    o.user_id,
                    fsi.flash_sale_id,
                    o.total,
                    pay.method,
                    o.shipping_address,
                    o.shipping_name,
                    o.shipping_phone,
                    o.discount_value,
                    fsi.flash_sale_price
                FROM orders o
                    INNER JOIN order_items oi ON oi.order_id = o.id
                    INNER JOIN product_sizes ps ON oi.size_id = ps.id
                    INNER JOIN product_colors pc ON ps.color_id = pc.id
                    INNER JOIN products p ON pc.product_id = p.id
                    LEFT JOIN flash_sale_items fsi ON fsi.size_id = ps.id
                    INNER JOIN payments pay ON o.id = pay.order_id`; 
const baseQueryTmp = `SELECT 
                    o.id AS order_id,
                    p.name AS product_name,
                    p.id AS product_id,
                    pc.color,
                    pc.image_url,
                    ps.size,
                    oi.id as item_id,
                    oi.quantity,
                    oi.price,
                    o.status,
                    o.created_at,
                    o.total,
                    pay.method,
                    o.shipping_address,
                    o.shipping_name,
                    o.shipping_phone,
                    o.discount_value,
                    fsi.flash_sale_price
                FROM orders o
                    INNER JOIN order_items oi ON oi.order_id = o.id
                    INNER JOIN product_sizes ps ON oi.size_id = ps.id
                    INNER JOIN product_colors pc ON ps.color_id = pc.id
                    INNER JOIN products p ON pc.product_id = p.id
                    LEFT JOIN flash_sale_items fsi ON fsi.size_id = ps.id
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
                    payment_method: row.method,
                    shipping_address: row.shipping_address,
                    shipping_name: row.shipping_name,
                    shipping_phone: row.shipping_phone,
                    discount_value: row.discount_value,
                    shop_id: row.shop_id,
                    user_id: row.user_id
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
                image_url: row.image_url,
                flash_price: row.flash_sale_price,
                flash_sale_id: row.flash_sale_id
            })
        })
} 
export const getOrderOfme = async (user_id: number): Promise<GetOrder[]> => {
    const query = `SELECT 
                    o.id AS order_id,
                    p.name AS product_name,
                    p.id AS product_id,
                    pc.color,
                    pc.image_url,
                    ps.size,
                    oi.id as item_id,
                    oi.quantity,
                    oi.price,
                    o.status,
                    o.created_at,
                    o.total,
                    fsi.flash_sale_price,
                    p.shop_id
                FROM orders o
                    INNER JOIN order_items oi ON oi.order_id = o.id
                    INNER JOIN product_sizes ps ON oi.size_id = ps.id
                    INNER JOIN product_colors pc ON ps.color_id = pc.id
                    INNER JOIN products p ON pc.product_id = p.id
                    LEFT JOIN flash_sale_items fsi ON fsi.size_id = ps.id
                WHERE o.user_id = @user_id 
                ORDER BY o.id DESC`;
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input('user_id', user_id)
            .query(query);

        const orderMaps: Record<number, GetOrder> = {};
        transformationOrder(result.recordset, orderMaps);
        return Object.values(orderMaps).reverse();
    } catch (error) {
        console.log(error);
        throw new AppError('Failed to fetching order', 500, false);
    }
}
export const existOrder = async (
    order_id: number
): Promise<{ id: number; status: string } | null> => {
    try {
        const pool = await connectionDB();
        const query = 'SELECT id, status FROM orders WHERE id = @order_id';
        const result = await pool
            .request()
            .input('order_id', order_id)
            .query(query);

        if (result.recordset.length === 0) {
            return null; 
        }
        const found = result.recordset[0];
        return { id: Number(found.id), status: found.status };
    } catch (error) {
        console.error("Error checking existOrder:", error);
        return null;
    }
};

export const getOrderById = async (order_id: number) : Promise<GetOrder |null> => {
    const query = `${baseQueryTmp}
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
    const query = `INSERT INTO orders (user_id, total, shipping_name, shipping_address, shipping_phone, voucher_id, discount_value)
                   OUTPUT INSERTED.id AS orderId
                   VALUES (@user_id, @total, @shipping_name, @shipping_address, @shipping_phone, @voucher_id, @discount_value)`;
    const result = await new mssql.Request(transaction)
        .input('user_id', order.user_id)
        .input('total', order.total)
        .input('status', order.status)
        .input('shipping_name', order.shipping_name)
        .input('shipping_address', order.shipping_address)
        .input('shipping_phone', order.shipping_phone)
        .input('voucher_id', order.voucher_id || null)
        .input('discount_value', order.discount_value || null)
        .query(query);
    return result.recordset[0].orderId;
}
const insertOrderItems = async (transaction: mssql.Transaction, orderId: number, orderItems: OrderItem[]): Promise<void> => {
    const query = `INSERT INTO order_items (order_id, size_id, quantity, price, flash_sale_item_id)
                   VALUES (@order_id, @size_id, @quantity, @price, @flash_sale_item_id)`;
    for (const item of orderItems) {
        await new mssql.Request(transaction)
            .input('order_id', orderId)
            .input('size_id', item.size_id)
            .input('quantity', item.quantity)
            .input('price', item.price)
            .input('flash_sale_item_id', item.flash_sale_item_id)
            .query(query);
        await updateProductStock(transaction, item.size_id, item.quantity);
    }
}
const updateProductStock = async (transaction: mssql.Transaction, size_id: number, quantity: number ): Promise<void> => {
    const request = new mssql.Request(transaction);
    request.input('size_id', size_id);
    request.input('quantity', quantity);
  
    const checkFlashSale = `
      SELECT ISNULL(fsi.stock - fsi.sold, 0) AS flash_remaining
      FROM flash_sale_items AS fsi
      JOIN flash_sales AS fs ON fs.id = fsi.flash_sale_id
      WHERE fsi.size_id = @size_id
        AND fsi.status = 'active'
        AND fs.status = 'active'
    `;
    const result = await request.query(checkFlashSale);
    const flashRemaining = result.recordset[0]?.flash_remaining ?? 0;
  
    const flashSaleDeduct = Math.min(quantity, flashRemaining);
  
    if (flashSaleDeduct > 0) {
      const updateFlashSale = `
        UPDATE fsi
        SET fsi.sold = fsi.sold + @flashSaleDeduct
        FROM flash_sale_items AS fsi
        JOIN flash_sales AS fs ON fs.id = fsi.flash_sale_id
        WHERE fsi.size_id = @size_id
          AND fsi.status = 'active'
          AND fs.status = 'active'
      `;
      await new mssql.Request(transaction)
        .input('size_id', size_id)
        .input('flashSaleDeduct', flashSaleDeduct)
        .query(updateFlashSale);
    }
      const updateProduct = `
      UPDATE product_sizes
      SET stock = stock - @quantity
      WHERE id = @size_id
    `;
    await new mssql.Request(transaction)
      .input('size_id', size_id)
      .input('quantity', quantity)
      .query(updateProduct);
  };
  
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
        console.log("failed", error);
        throw new AppError('Failed to confirm order', 500, false);
    }
}
export const getShopIdBySizeId = async (size_id: number): Promise<number> => {
    const query = `SELECT p.shop_id
                    FROM product_sizes ps
                    INNER JOIN product_colors pc ON ps.color_id = pc.id
                    INNER JOIN products p ON pc.product_id = p.id
                    WHERE ps.id = @size_id`;
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input('size_id', size_id)
            .query(query);

        return result.recordset[0].shop_id;
    } catch (error) {
        console.log(error);
        throw new AppError('Failed to get shop id by size id', 500, false);
    }
}
export const getOrderOfShopMe = async (shop_id: number): Promise<GetOrder[]> => {
     const query = `${baseQuery}
                    WHERE p.shop_id = @shop_id
                    ORDER BY o.created_at DESC`;
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input('shop_id', shop_id)
            .query(query);
        const orderMaps : Record<number, GetOrder> = {};
        transformationOrder(result.recordset, orderMaps);

        return Object.values(orderMaps);

    } catch (error) {
        console.log(error);
        throw new AppError(`Failed to fetch order by shop_id: ${shop_id}`, 500, false);
    }
}