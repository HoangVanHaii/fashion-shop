"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOderOfShopMe = exports.cancelOrder = exports.completeOrder = exports.dispatchOrder = exports.confirmOrder = void 0;
const orderService = __importStar(require("../../services/order"));
const appError_1 = require("../../utils/appError");
const user_1 = require("../../services/user");
const confirmOrder = async (req, res, next) => {
    try {
        const { order_id } = req.body;
        const order = await orderService.existOrder(order_id);
        if (!order) {
            throw new appError_1.AppError(`Order id ${order_id} does not exist`, 404);
        }
        await orderService.updateStatusOrder(order_id, 'confirmed');
        return res.json({ message: 'Update successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.confirmOrder = confirmOrder;
const dispatchOrder = async (req, res, next) => {
    try {
        const { order_id } = req.body;
        const order = await orderService.existOrder(order_id);
        if (!order) {
            throw new appError_1.AppError(`Order id ${order_id} does not exist`, 404);
        }
        await orderService.updateStatusOrder(order_id, 'shipped');
        return res.json({ message: 'Update successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.dispatchOrder = dispatchOrder;
const completeOrder = async (req, res, next) => {
    try {
        const { order_id } = req.body;
        const order = await orderService.existOrder(order_id);
        if (!order) {
            throw new appError_1.AppError(`Order id ${order_id} does not exist`, 404);
        }
        await orderService.updateStatusOrder(order_id, 'completed');
        res.status(200).json({ message: `Order ${order_id} marked as completed.` });
    }
    catch (error) {
        next(error);
    }
};
exports.completeOrder = completeOrder;
const cancelOrder = async (req, res, next) => {
    try {
        const { order_id } = req.body;
        const order = await orderService.existOrder(order_id);
        if (!order) {
            throw new appError_1.AppError(`Order id ${order_id} does not exist`, 404);
        }
        await orderService.updateStatusOrder(order_id, 'cancelled');
        res.status(200).json({ message: `Order ${order_id} has been cancelled.` });
    }
    catch (error) {
        next(error);
    }
};
exports.cancelOrder = cancelOrder;
const getOderOfShopMe = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const shop_id = await (0, user_1.getShopIdByUserId)(user_id);
        const order = await orderService.getOrderOfShopMe(shop_id);
        if (!order) {
            throw new appError_1.AppError(`Order id ${shop_id} does not exist`, 404);
        }
        res.json(order.reverse());
    }
    catch (error) {
        next(error);
    }
};
exports.getOderOfShopMe = getOderOfShopMe;
