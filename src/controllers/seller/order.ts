import *as orderService from '../../services/order';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/appError';
import { getShopIdByUserId } from '../../services/user';

export const confirmOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { order_id } = req.body;
        const order = await orderService.getOrderById(order_id);
        if(!order){
            throw new AppError(`Order id ${order_id} does not exist`, 404);
        }
        await orderService.updateStatusOrder(order_id, 'confirm');
    } catch (error) {
        next(error);
    }
}
export const dispatchOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
        const { order_id } = req.body;
        const order = await orderService.getOrderById(order_id);
        if(!order){
            throw new AppError(`Order id ${order_id} does not exist`, 404);
        }
        if(order)
        await orderService.updateStatusOrder(order_id, 'shipped');
    } catch (error) {
        next(error);
    }
}
export const completeOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { order_id } = req.body;
        const order = await orderService.getOrderById(order_id);
        if (!order) {
            throw new AppError(`Order id ${order_id} does not exist`, 404);
        }
        await orderService.updateStatusOrder(order_id, 'completed');
        res.status(200).json({ message: `Order ${order_id} marked as completed.` });
    } catch (error) {
        next(error);
    }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { order_id } = req.body;
        const order = await orderService.getOrderById(order_id);
        if (!order) {
            throw new AppError(`Order id ${order_id} does not exist`, 404);
        }
        await orderService.updateStatusOrder(order_id, 'cancelled');
        res.status(200).json({ message: `Order ${order_id} has been cancelled.` });
    } catch (error) {
        next(error);
    }
};
export const getOderOfShopMe = async (req: Request, res: Response, next : NextFunction) => {
     try {
        const user_id = req.user!.id;
        const shop_id = await getShopIdByUserId(user_id);
        const order = await orderService.getOrderOfShopMe(shop_id);
        if (!order) {
            throw new AppError(`Order id ${shop_id} does not exist`, 404);
        }
        res.json(order);
    } catch (error) {
        next(error);
    }
}