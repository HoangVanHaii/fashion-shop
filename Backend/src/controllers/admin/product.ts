import * as productService from "../../services/product";
import { ProductPayload, ProductColor, ProductSize } from "../../interfaces/product";
import { Request, Response, NextFunction } from "express";

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await productService.getAllProducts();
        res.status(200).json(products);
    } catch (error: any) {
        next(error);
    }
}
export const getAllProductsHidden = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await productService.getAllProductsHidden();
        res.status(200).json(products);
    } catch (error: any) {
        next(error);
    }
}