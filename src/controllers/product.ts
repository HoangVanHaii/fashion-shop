import * as productService from "../services/product";
import { Product } from "../interfaces/product";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const products = await productService.getAllProducts();
		res.status(200).json(products);
	} catch (error: any) {
		next(error);
	}
}
export const addProduct = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { shop_id, category_id, name, description, price, stock } = req.body;
		const product = { shop_id, category_id, name, description, price, stock } as Product;

		await productService.addProduct(product);
		res.status(201).json({ message: "Product added successfully" });
	} catch (error: any) {
		next(error);
	}
}
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id, shop_id, category_id, name, description, price, stock, status } = req.body;
		const existingProduct = await productService.getProductById(id);
		if (!existingProduct) {
			throw new AppError("Product not found", 404);
		}
		if (category_id) {
			//addtional check category exists
			const categoryExists = await productService.getCategoryById(category_id);
			if (!categoryExists) {
				throw new AppError("Category not found", 404);
			}
		}
		const product = { id, shop_id, category_id, name, description, price, stock, status } as Product;
		await productService.updateProduct(product);
		res.status(200).json({ message: "Product updated successfully" });
	} catch (error: any) {
		next(error);
	}
}
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		let id: number = parseInt(req.params.id);
		const products = await productService.getProductById(id);
		if (products == null) {
			throw new AppError("Product not found", 404);
		}
		res.status(200).json(products);
	} catch (error: any) {
		next(error);
	}
}
export const getProductByName = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const name: string = req.query.name as string;
		const products = await productService.getProductByName(name);
		if (products.length === 0) {
			throw new AppError("No products found with the given name", 404);
		}
		res.status(200).json(products);
	} catch (error: any) {
		next(error);
	}
}
export const softDeleteProduct = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.body;
		await productService.softDeleteProduct(id);
		res.status(200).json({ message: "Product soft-deleting successfully" });
	} catch (error: any) {
		next(error);
	}
}
export const getProductsActive = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const products = await productService.getProductsActive();
		res.status(200).json(products);
	} catch (error: any) {
		next(error);
	}
}
export const getLatestProducts = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const limit: number = parseInt(req.query.limit as string) || 10;
		const products = await productService.getLatestProducts(limit);
		res.status(200).json(products);
	} catch (error: any) {
		next(error);
	}
}
export const getProductByShop = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const shop_id: number = parseInt(req.query.shop_id as string);
		const products = await productService.getProductByShop(shop_id);
		res.status(200).json(products);
	} catch (error: any) {
		next(error);
	}
}
export const getProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const category_id: number = parseInt(req.query.category_id as string)
		const products = await productService.getProductsByCategory(category_id);
		res.status(200).json(products);
	} catch (error: any) {
		next(error);
	}
}
export const getBestSellerProduct = async (req: Request, res: Response, next: NextFunction) => {
	try {
		let limit: number = parseInt(req.query.limit as string);
		const products = await productService.getBestSellerProduct(limit);
		res.status(200).json(products);
	} catch (error: any) {
		next(error);
	}
}
export const getMostDiscountedProduct = async (req: Request, res: Response, next: NextFunction) => {
	try {
		let limit: number = parseInt(req.query.limit as string);
		const products = await productService.getMostDiscountedProduct(limit);
		res.status(200).json(products);
	} catch (error: any) {
		next(error);
	}
}
