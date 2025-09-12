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
        throw err;
    }
}

