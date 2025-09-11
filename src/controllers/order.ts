import *as orderService from '../services/order'
import *as productService from '../services/product'
import { Order, OrderItem } from '../interfaces/order'
import { Request, Response, NextFunction } from 'express';
import { validateVoucher } from '../services/voucher';
import { AppError } from '../utils/appError';

export const createOrder = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const user_id  = req.user?.id;
        const {orderItems, voucherCode, shipping_name, shipping_address, shipping_phone, method_payment, statusPayment} = req.body;

        let total = 0;
        const orderItemsData: OrderItem[] = [];
        for(const item of orderItems){
            const product = await productService.getProductById(item.product_id);

            if(!product || product.status !== 'active'){
                throw new AppError(`Product with ID ${item.product_id} not found or inactive`, 404);
            }
            if(item.quantity > product.stock){
                throw new AppError(`Insufficient stock for product ID ${item.product_id}`, 400);
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
        // return;
        total -= discount;

        if(total < 0) total = 0; 
        const orderData: Order = {
            user_id: user_id!,
            total: total,
            payment_method: method_payment,
            shipping_name: shipping_name,
            shipping_address: shipping_address,
            shipping_phone: shipping_phone,
            status: 'pending'
        }
        await orderService.createOder({order: orderData, orderItems: orderItemsData}, statusPayment);
        return res.status(201).json({ message: 'Order created successfully' });
    } catch (error: any) {
        next(error);
    }
}