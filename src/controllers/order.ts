import *as orderService from '../services/order'
import *as productService from '../services/product'
import { Order, OrderItem } from '../interfaces/order'
import { Request, Response } from 'express';
import { validateVoucher } from '../services/voucher';

export const createOrder = async (req: Request, res: Response)=> {
    try {
        const user_id  = req.user?.id;
        const {orderItems, voucherCode} = req.body;
        let total = 0;
        const orderItemsData: OrderItem[] = [];
        for(const item of orderItems){
            const product = await productService.getProductById(item.product_id);
            if(!product || product.status !== 'active'){
                return res.status(400).json({ message: `Product with ID ${item.product_id} is not available.` });
            }
            if(item.quantity > product.stock){
                return res.status(400).json({ message: `Insufficient stock for product ID ${item.product_id}. Available stock: ${product.stock}` });
            }
            total += item.quantity * product.price;
            item.price = product.price; 
            const orderItem: OrderItem = {
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price
            }
            orderItemsData.push(orderItem);
        }
        const discount = await validateVoucher(voucherCode, total);
        total -= discount;
        if(total < 0) total = 0; 
        const orderData: Order = {
            user_id: user_id!,
            total: total,
            status: 'pending'
        }
        await orderService.createOder({order: orderData, orderItems: orderItemsData});
        return res.status(201).json({ message: 'Order created successfully' });
    } catch (error: any) {
        return res.status(error.status || 500).json({ message: 'Internal server error' });
    }
}