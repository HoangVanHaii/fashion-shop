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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderByUser = exports.getOrderById = exports.updateAdressOrder = exports.getOrderOfme = exports.createOrder = void 0;
const orderService = __importStar(require("../services/order"));
const productService = __importStar(require("../services/product"));
const addressService = __importStar(require("../services/address"));
const paymentUntils = __importStar(require("../utils/vnpay"));
const voucher_1 = require("../services/voucher");
const appError_1 = require("../utils/appError");
const redisClient_1 = __importDefault(require("../config/redisClient"));
const ORDER_CACHE_KEY = (order_id) => `order:${order_id}`;
const makeOrderItem = async (orderItems, voucherCode) => {
    const orderItemsData = [];
    for (const item of orderItems) {
        const productSize = await productService.getProductSizesBySizeId(item.size_id);
        if (!productSize) {
            throw new appError_1.AppError(`Size with ID ${item.size_id} not found`, 404);
        }
        if (productSize.stock < item.quantity) {
            throw new appError_1.AppError(`Insufficient stock for size ${productSize.id} (available: ${productSize.stock}, requested: ${item.quantity}`, 400);
        }
        item.price = productSize.price;
        const orderItem = {
            size_id: item.size_id,
            quantity: item.quantity,
            price: productSize.flash_sale_price && productSize.flash_sale_price < item.price ? productSize.flash_sale_price : item.price,
            flash_sale_item_id: productSize.flash_sale_item_id
        };
        orderItemsData.push(orderItem);
    }
    return { orderItemsData };
};
const splitOrderItems = async (orderItems, voucherCode) => {
    let total = 0, discount = 0;
    const recordOrderItem = {};
    for (const item of orderItems) {
        const shop_id = await orderService.getShopIdBySizeId(item.size_id);
        if (!shop_id) {
            throw new appError_1.AppError(`Size id ${item.size_id} does not exist`, 404);
        }
        if (!recordOrderItem[shop_id]) {
            recordOrderItem[shop_id] = { orderItems: [], totalPrice: 0 };
        }
        recordOrderItem[shop_id].orderItems.push(item);
        recordOrderItem[shop_id].totalPrice += item.price * item.quantity;
        total += item.price * item.quantity;
    }
    if (voucherCode) {
        discount = await (0, voucher_1.validateVoucher)(voucherCode, total);
        total -= discount;
        if (total < 0)
            total = 0;
    }
    return { recordOrderItem, total, discount };
};
const createOrder = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const { orderItems, voucherCode, shippingName, shippingAddress, shippingPhone, methodPayment } = req.body;
        const { orderItemsData } = await makeOrderItem(orderItems, voucherCode);
        const { recordOrderItem, total, discount } = await splitOrderItems(orderItemsData, voucherCode);
        console.log(req.body);
        const voucher_id = await (0, voucher_1.getVoucherIdByCode)(voucherCode);
        let discount_value = discount / Object.values(recordOrderItem).length || 0;
        const orderData = {
            user_id: user_id,
            total: total,
            voucher_id: voucher_id || undefined,
            discount_value: discount_value || 0,
            payment_method: methodPayment,
            shipping_name: shippingName,
            shipping_address: shippingAddress,
            shipping_phone: shippingPhone,
        };
        let listOrderId = "", totalAmount = 0;
        for (const key in recordOrderItem) {
            const itemData = recordOrderItem[key];
            orderData.total = itemData.totalPrice;
            orderData.total -= discount_value;
            if (orderData.total < 0)
                orderData.total = 0;
            const paymentData = await orderService.createOder({ order: orderData, orderItems: itemData.orderItems });
            totalAmount += paymentData.amount;
            listOrderId += paymentData.order_id + ",";
        }
        if (methodPayment === 'vnpay') {
            if (total < 5000) {
                throw new appError_1.AppError("Minimum order amount for VNPAY is 5000", 400);
            }
            const paymentUrl = await paymentUntils.buildPaymentUrl(listOrderId.slice(0, -1), totalAmount);
            await redisClient_1.default.del(`getOrderOfme:${user_id}`);
            return res.status(201).json({ paymentUrl });
        }
        await redisClient_1.default.del(`getOrderOfme:${user_id}`);
        return res.status(201).json({ message: 'Order created successfully (COD)' });
    }
    catch (error) {
        next(error);
    }
};
exports.createOrder = createOrder;
const getOrderOfme = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const cacheKey = `getOrderOfme:${user_id}`;
        const cachedOrder = await redisClient_1.default.get(cacheKey);
        if (cachedOrder) {
            console.log("✅ Cache hit:", cacheKey);
            return res.status(200).json(JSON.parse(cachedOrder));
        }
        const orders = await orderService.getOrderOfme(user_id);
        console.log('miss -> save new data');
        await redisClient_1.default.setEx(cacheKey, 3600, JSON.stringify(orders));
        res.status(200).json(orders);
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderOfme = getOrderOfme;
const updateAdressOrder = async (req, res, next) => {
    try {
        const { order_id, address_id } = req.body;
        const order = await orderService.getOrderById(order_id);
        if (!order) {
            throw new appError_1.AppError(`Order id ${order_id} does not exist`, 404);
        }
        const address = await addressService.getAddressById(req.user.id, address_id);
        if (!address) {
            throw new appError_1.AppError(`Address id ${address_id} does not exist`, 404);
        }
        await orderService.updateAdressOrder(order_id, address);
        await redisClient_1.default.del(ORDER_CACHE_KEY(order_id));
        res.status(200).json({
            success: true,
            mesage: `Update shipping address for ${order_id} successfully`
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAdressOrder = updateAdressOrder;
const getOrderById = async (req, res, next) => {
    try {
        const order_id = parseInt(req.params.id);
        const cacheKey = ORDER_CACHE_KEY(order_id);
        const cachedOrder = await redisClient_1.default.get(cacheKey);
        if (cachedOrder) {
            console.log("✅ Cache hit:", cacheKey);
            return res.status(200).json(JSON.parse(cachedOrder));
        }
        const order = await orderService.getOrderById(order_id);
        if (!order) {
            throw new appError_1.AppError(`Order id ${order_id} not found`, 404);
        }
        await redisClient_1.default.setEx(cacheKey, 3600, JSON.stringify(order));
        res.status(200).json(order);
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderById = getOrderById;
const cancelOrderByUser = async (req, res, next) => {
    try {
        const { order_id } = req.body;
        const order = await orderService.existOrder(order_id);
        if (!order) {
            throw new appError_1.AppError(`Order id ${order_id} does not exist`, 404);
        }
        if (order.status !== 'pending') {
            throw new appError_1.AppError(`Order has status ${order.status}, can't cancel`, 400);
        }
        await redisClient_1.default.del(ORDER_CACHE_KEY(order_id));
        await redisClient_1.default.del(`getOrderOfme:${req.user.id}`);
        await orderService.updateStatusOrder(order_id, 'cancelled');
        res.status(200).json({ message: `Order ${order_id} has been cancelled.` });
    }
    catch (error) {
        next(error);
    }
};
exports.cancelOrderByUser = cancelOrderByUser;
