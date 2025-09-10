import { Cart, CartItem, CartItemDetail } from "../interfaces/cart";
import { Request, Response } from "express";
import * as cartService from "../services/cart";

export const addtoCart = async (req: Request, res: Response) => {
    try {
        const user_id = req.user!.id;
        const { product_id, quantity } = req.body;
        await cartService.addToCart(user_id, product_id, quantity);
        return res.status(201).json({
            success: true,
            message: "Product added to cart"
        });
    } catch (err : any) {
        const status = err.status || 500;
        const message = err.message || "Internal server error";
        console.log("addToCart error: ", message);
        return res.status(status).json({
            success: false,
            message: message    
        })
    }
}

