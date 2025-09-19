import *as orderService from '../services/order'
import *as productService from '../services/product'
import *as addressService from '../services/address'
import { Order, OrderItem } from '../interfaces/order'
import { ProductPayload } from '../interfaces/product';
import e, { Request, Response, NextFunction } from 'express';
import { validateVoucher } from '../services/voucher';
import { validateOrderItem } from '../middlewares/validateOrder'
import { AppError } from '../utils/appError';

export const createOrder = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const user_id  = req.user!.id;
        const { orderItems, voucherCode, shipping_name, shipping_address, shipping_phone, method_payment, statusPayment } = req.body;

        let total = 0;
        const orderItemsData: OrderItem[] = [];
        for(const item of orderItems){
            const product: ProductPayload = await productService.getProductById(item.product_id);
            const productSize = validateOrderItem(product, item);

            total += item.quantity * productSize.price;
            item.price = productSize.price; 
            const orderItem: OrderItem = {
                product_id: item.product_id,
                color_id: item.color_id,
                size_id: item.size_id,
                quantity: item.quantity,
                price: item.price
            }
            orderItemsData.push(orderItem);
        }
        if(voucherCode){
            const discount = await validateVoucher(voucherCode, total);
            total -= discount;
        }

        if(total < 0) total = 0; 
        const orderData: Order = {
            user_id: user_id!,
            total: total,
            payment_method: method_payment,
            shipping_name: shipping_name,
            shipping_address: shipping_address,
            shipping_phone: shipping_phone,
        }
        await orderService.createOder({order: orderData, orderItems: orderItemsData}, statusPayment);
        return res.status(201).json({ message: 'Order created successfully' });
    } catch (error: any) {
        next(error);
    }
}
export const getOrderOfme = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.user!.id;
        const orders = await orderService.getOrderOfme(user_id)
        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
}
export const getOrderById = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const  order_id: number  = parseInt(req.params.id);
        const order = await orderService.getOrderById(order_id);
        if(order == null) {
            return res.status(201).json({message: "Order not found"});
        }
        res.status(200).json(order);
    } catch (error) {
        next(error);
    }
}
export const updateAdressOrder = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { order_id, address_id} = req.body;
        const order = await orderService.getOrderById(order_id);
        if(!order){
            throw new AppError(`Order id ${order_id} does not exist`, 404);
        }
        const address = await addressService.getAddressById(req.user!.id, address_id);
        if(!address){
            throw new AppError(`Address id ${address_id} does not exist`, 404);
        }
        await orderService.updateAdressOrder(order_id, address);
        res.status(200).json({
            success: true,
            mesage: `Update shipping address for ${order_id} successfully`
        });
    } catch (error) {
        next(error);
    }
}

export const cancelOrderByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { order_id } = req.body;
        const order = await orderService.getOrderById(order_id);
        if (!order) {
            throw new AppError(`Order id ${order_id} does not exist`, 404);
        }
        if(order.status !== 'pending'){
            throw new AppError(`Order has status ${order.status}, can't cancel`, 400);
        }
        await orderService.updateStatusOrder(order_id, 'cancelled');
        res.status(200).json({ message: `Order ${order_id} has been cancelled.` });
    } catch (error) {
        next(error);
    }
};
