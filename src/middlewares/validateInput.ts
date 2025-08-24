import { Request, Response } from "express";
import *as productService from "../services/product";

export const addProduct = async(req: Request, res: Response, next: any) => {
    const { shop_id, category_id, name, description, price, stock } = req.body;
    if (!shop_id || !category_id || !name || price === undefined || stock === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    next();
}
export const updateProduct = async(req: Request, res: Response, next: any) => {
    const {id, shop_id, category_id, name, description, price, stock, status } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Product ID is required" });
    }
    if (category_id !== undefined) {
        const exists = await productService.checkCategoryExists(category_id);
        if (!exists) {
            return res.status(400).json({ message: "Category ID does not exist" });
        }
    }
    if(status !== undefined && !['active', 'hidden', 'banned'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }
    if( shop_id == undefined && category_id == undefined && name == undefined && description == undefined && price == undefined && stock == undefined && status == undefined) {
        return res.status(400).json({ message: "At least one field to update must be provided" });
    }   
    next();
}
export const softDeleteProduct = async(req: Request, res: Response, next: any) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: "Product ID is required" });
    }
    next();
}