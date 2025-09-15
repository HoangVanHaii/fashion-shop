import *as orderService from '../services/order'
import *as productService from '../services/product'
import { Order, OrderItem } from '../interfaces/order'
import { ProductPayload, ProductColor, ProductSize } from '../interfaces/product';
import { Request, Response, NextFunction } from 'express';
import { validateVoucher } from '../services/voucher';
import { validateOrderItem } from '../middlewares/validateOrder'
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