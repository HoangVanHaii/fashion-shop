import * as productService from "../services/product";
import { ProductSummary } from "../interfaces/product";
import { Request, Response, NextFunction } from "express";
import redisClient from "../config/redisClient";

export const getProductsActive = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const cacheKey = 'products:active';
		const cachedData = await redisClient.get(cacheKey);
		if(cachedData){
			console.log("Cache hit");
      		return res.status(200).json(JSON.parse(cachedData));
		}

		const products = await productService.getProductsActive();

		await redisClient.setEx(cacheKey, 300, JSON.stringify(products));
		console.log("Cache miss → saved new data");

		res.status(200).json(products);
	} catch (error) {
		next(error);
	}
}
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		let id: number = parseInt(req.params.id);
		const products = await productService.getProductById(id);
		if (products == null) {
			return res.status(200).send({message: "Product not found"});
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
			return res.status(200).json({message: "No products found with the given name"});
		}
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
export const getLatestProducts = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const limit: number = parseInt(req.query.limit as string) || 10;
		const products = await productService.getLatestProducts(limit);
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
