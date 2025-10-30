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
exports.clearCart = exports.removeCartItem = exports.updateCartItem = exports.updateCartItemQuantity = exports.getCartItemCount = exports.getCartItems = exports.addtoCart = void 0;
const cartService = __importStar(require("../services/cart"));
const appError_1 = require("../utils/appError");
const addtoCart = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const { quantity, size_id } = req.body;
        const cartItem = { quantity, size_id };
        ;
        await cartService.addToCart(user_id, cartItem);
        return res.status(201).json({
            success: true,
            message: "Product added to cart"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.addtoCart = addtoCart;
const getCartItems = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const cart = await cartService.getCartItems(user_id);
        return res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            data: cart
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getCartItems = getCartItems;
const getCartItemCount = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const count = await cartService.countCartItems(user_id);
        return res.status(200).json({
            success: true,
            message: "Cart item count fetched successfully",
            data: { count }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getCartItemCount = getCartItemCount;
const updateCartItemQuantity = async (req, res, next) => {
    try {
        const cart_item_id = parseInt(req.params.id);
        const { quantity } = req.body;
        if (isNaN(cart_item_id)) {
            throw new appError_1.AppError("Invalid cart item id", 400);
        }
        await cartService.updateCartItemQuantity(cart_item_id, quantity);
        return res.status(200).json({
            success: true,
            message: "Cart item quantity updated successfully"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateCartItemQuantity = updateCartItemQuantity;
const updateCartItem = async (req, res, next) => {
    try {
        const cart_item_id = parseInt(req.params.id);
        const { size_id } = req.body;
        await cartService.updateCartItem(cart_item_id, size_id);
        return res.status(200).json({
            success: true,
            message: "Cart item updated successfully"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateCartItem = updateCartItem;
const removeCartItem = async (req, res, next) => {
    try {
        const cart_item_id = parseInt(req.params.id);
        if (isNaN(cart_item_id)) {
            throw new appError_1.AppError("Invalid cart item id", 400);
        }
        await cartService.removeCartItem(cart_item_id);
        return res.status(200).json({
            success: true,
            message: "Cart item removed successfully"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.removeCartItem = removeCartItem;
const clearCart = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        await cartService.clearCart(user_id);
        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.clearCart = clearCart;
