import { Cart, CartItem, CartItemDetail } from "../interfaces/cart";
import { Request, Response, NextFunction } from "express";
import * as cartService from "../services/cart";
import { AppError } from "../utils/appError";

export const addtoCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.user!.id;
        const { product_id, quantity, size_id, color_id } = req.body;
        const cartItem = {product_id, quantity, size_id, color_id} as CartItem;   
        await cartService.addToCart(user_id, cartItem);
        return res.status(201).json({
            success: true,
            message: "Product added to cart"
        });
    } catch (err : any) {
        next(err);
    }
}
export const getCartItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.user!.id;
        const cart: Cart = await cartService.getCartItems(user_id);
        return res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            data: cart
        });
    } catch (err : any) {
        next(err);
    }
}   
export const updateCartItemQuantity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cart_item_id = parseInt(req.params.id);
        const { quantity } = req.body;
        if(isNaN(cart_item_id)) {
            throw new AppError("Invalid cart item id", 400);
        }
        await cartService.updateCartItemQuantity(cart_item_id, quantity);
        return res.status(200).json({
            success: true,
            message: "Cart item quantity updated successfully"
        });
    } catch (err : any) {
        next(err);
    }
}
export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cart_item_id = parseInt(req.params.id);
        const { size_id, color_id } = req.body;
        if(isNaN(cart_item_id)) {
            throw new AppError("Invalid cart item id", 400);
        }
        await cartService.updateCartItem(cart_item_id, color_id, size_id);
        console.log(color_id, size_id);
        return res.status(200).json({
            success: true,
            message: "Cart item updated successfully"
        });
    } catch (err : any) {
        next(err);
    }
}
export const removeCartItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cart_item_id = parseInt(req.params.id);
        if(isNaN(cart_item_id)) {
            throw new AppError("Invalid cart item id", 400);
        }
        await cartService.removeCartItem(cart_item_id);
        return res.status(200).json({
            success: true,
            message: "Cart item removed successfully"
        })
    } catch (err : any) {
        next(err);
    }
}
export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
     try {
        const user_id = req.user!.id;
         await cartService.clearCart(user_id);
         return res.status(200).json({
             success: true,
             message: "Cart cleared successfully"
         })
     } catch (err : any) {
        next(err);
     }
 }