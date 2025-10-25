import *as orderService from '../services/order'
import *as productService from '../services/product'
import *as addressService from '../services/address'
import *as paymentUntils from '../utils/vnpay'
import { Order, OrderItem } from '../interfaces/order'
import { Request, Response, NextFunction } from 'express';
import { validateVoucher, getVoucherIdByCode } from '../services/voucher';
import { AppError } from '../utils/appError';
import redisClient from '../config/redisClient'
const ORDER_CACHE_KEY = (order_id: number) => `order:${order_id}`;


const makeOrderItem = async (orderItems: any, voucherCode: any): Promise<any> => {
    const orderItemsData: OrderItem[] = [];
    for (const item of orderItems) {
        const productSize = await productService.getProductSizesBySizeId(item.size_id);
        if (!productSize) {
            throw new AppError(`Size with ID ${item.size_id} not found`, 404);
        }
        if(productSize.stock < item.quantity) {
            throw new AppError(`Insufficient stock for size ${productSize.id} (available: ${productSize.stock}, requested: ${item.quantity}`, 400)
        }
        item.price = productSize.price;
        const orderItem: OrderItem = {
            size_id: item.size_id,
            quantity: item.quantity,
            price: productSize.flash_sale_price && productSize.flash_sale_price < item.price ? productSize.flash_sale_price: item.price,
            flash_sale_item_id: productSize.flash_sale_item_id
        }
        orderItemsData.push(orderItem);
    }
    return { orderItemsData };
}
const splitOrderItems = async (orderItems: any, voucherCode: string): Promise<any> => {
    let total = 0, discount = 0;
    const recordOrderItem: Record<number, { orderItems: OrderItem[]; totalPrice: number }> = {};
    for (const item of orderItems) {
        const shop_id: number | null = await orderService.getShopIdBySizeId(item.size_id);
        if(!shop_id){
            throw new AppError(`Size id ${item.size_id} does not exist`, 404);
        }
        if(!recordOrderItem[shop_id]){
            recordOrderItem[shop_id] = { orderItems: [], totalPrice: 0 };
        }
        recordOrderItem[shop_id].orderItems.push(item);
        recordOrderItem[shop_id].totalPrice += item.price * item.quantity;
        total += item.price * item.quantity;
    }
    if (voucherCode) {
        discount = await validateVoucher(voucherCode, total);
        total -= discount;
        if(total < 0) total = 0;
    }
    return { recordOrderItem, total, discount };
}

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.user!.id;
        const { orderItems, voucherCode, shippingName, shippingAddress, shippingPhone, methodPayment } = req.body;
        const { orderItemsData } = await makeOrderItem(orderItems, voucherCode);
        const { recordOrderItem, total, discount } = await splitOrderItems(orderItemsData, voucherCode);
        console.log(req.body);
        const voucher_id = await getVoucherIdByCode(voucherCode)
        let discount_value = discount / Object.values(recordOrderItem).length || 0;

        const orderData: Order = {
            user_id: user_id!,
            total: total,
            voucher_id: voucher_id || undefined,
            discount_value: discount_value || 0,
            payment_method: methodPayment,
            shipping_name: shippingName,
            shipping_address: shippingAddress,
            shipping_phone: shippingPhone,
        }
        let listOrderId = "", totalAmount = 0;
        for (const key in recordOrderItem) {
            const itemData = recordOrderItem[key];

            orderData.total = itemData.totalPrice;
            orderData.total -= discount_value;
            if(orderData.total < 0) orderData.total = 0;

            const paymentData = await orderService.createOder({ order: orderData, orderItems: itemData.orderItems });
            totalAmount += paymentData.amount;
            listOrderId += paymentData.order_id + ",";
        }

        if (methodPayment === 'vnpay') {
            if( total < 5000){
                throw new AppError("Minimum order amount for VNPAY is 5000", 400);
            }
            const paymentUrl = await paymentUntils.buildPaymentUrl(
                listOrderId.slice(0, -1),
                totalAmount
            );
            return res.status(201).json({ paymentUrl });
        }
        await redisClient.del(`getOrderOfme:${user_id}`);
        return res.status(201).json({ message: 'Order created successfully (COD)' });
    } catch (error: any) {
        next(error);
    }
}
export const getOrderOfme = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.user!.id;
        const cacheKey = `getOrderOfme:${user_id}`;
        const cachedOrder = await redisClient.get(cacheKey);

        if (cachedOrder) {
            console.log("✅ Cache hit:", cacheKey);
            return res.status(200).json(JSON.parse(cachedOrder));
        }

        const orders = await orderService.getOrderOfme(user_id)
        console.log('miss -> save new data')
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(orders));

        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
}

export const updateAdressOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { order_id, address_id } = req.body;
        const order = await orderService.getOrderById(order_id);
        if (!order) {
            throw new AppError(`Order id ${order_id} does not exist`, 404);
        }
        const address = await addressService.getAddressById(req.user!.id, address_id);
        if (!address) {
            throw new AppError(`Address id ${address_id} does not exist`, 404);
        }
        await orderService.updateAdressOrder(order_id, address);
        await redisClient.del(ORDER_CACHE_KEY(order_id));
        res.status(200).json({
            success: true,
            mesage: `Update shipping address for ${order_id} successfully`
        });
    } catch (error) {
        next(error);
    }
}

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order_id: number = parseInt(req.params.id);
        const cacheKey = ORDER_CACHE_KEY(order_id);

        const cachedOrder = await redisClient.get(cacheKey);
        if (cachedOrder) {
            console.log("✅ Cache hit:", cacheKey);
            return res.status(200).json(JSON.parse(cachedOrder));
        }
        const order = await orderService.getOrderById(order_id);
        if (!order) {
            throw new AppError(`Order id ${order_id} not found`, 404);
        }
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(order));

        res.status(200).json(order);
    } catch (error) {
        next(error);
    }
};
export const cancelOrderByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { order_id } = req.body;
        const order = await orderService.existOrder(order_id);
        if (!order) {
            throw new AppError(`Order id ${order_id} does not exist`, 404);
        }
        if (order.status !== 'pending') {
            throw new AppError(`Order has status ${order.status}, can't cancel`, 400);
        }
        await redisClient.del(ORDER_CACHE_KEY(order_id));
        await redisClient.del(`getOrderOfme:${req.user!.id}`)
        await orderService.updateStatusOrder(order_id, 'cancelled');
        res.status(200).json({ message: `Order ${order_id} has been cancelled.` });
    } catch (error) {
        next(error);
    }
};
