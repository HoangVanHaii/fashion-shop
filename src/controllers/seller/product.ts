import * as productService from "../../services/product";
import { ProductPayload, ProductColor, ProductSize } from "../../interfaces/product";
import { Request, Response, NextFunction } from "express";

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await productService.getAllProducts();
        res.status(200).json(products);
    } catch (error: any) {
        next(error);
    }
}
export const getProductsHidden = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await productService.getProductsHidden();
        res.status(200).json(products);
    } catch (error: any) {
        next(error);
    }
}
export const addProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { shop_id, category_id, name, description, colors } = req.body;
        const files = req.files as Express.Multer.File[];
        const parseColors = JSON.parse(colors);

        let productColors: ProductColor[] = [];
        for(let i = 0; i < parseColors.length ; i++){
            const color = parseColors[i];
            const image = files[i];
            let productSizes: ProductSize[] = [];
            for(const size of color.sizes){
                productSizes.push({size: size.size, stock: size.stock, price: size.price});
            }
            productColors.push({
                color: color.color, 
                image_url: `/uploads/products/${image.filename}`,
                is_main: i == 0,
                sizes: productSizes
            })
        }
        const productPayload:ProductPayload = { 
            shop_id:  Number(shop_id) ,
            category_id: Number(category_id), 
            name: String(name),
            description: String(description),
            colors:productColors
        };
        await productService.addProduct(productPayload);

        res.status(201).json({ message: "Product added successfully" });
    } catch (error: any) {
        next(error);
    }
}
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    // try {
    // 	const { id, shop_id, category_id, name, description, price, stock, status } = req.body;
    // 	const existingProduct = await productService.getProductById(id);
    // 	if (!existingProduct) {
    // 		throw new AppError("Product not found", 404);
    // 	}
    // 	if (category_id) {
    // 		//addtional check category exists
    // 		const categoryExists = await productService.getCategoryById(category_id);
    // 		if (!categoryExists) {
    // 			throw new AppError("Category not found", 404);
    // 		}
    // 	}
    // 	const product = { id, shop_id, category_id, name, description, price, stock, status } as Product;
    // 	await productService.updateProduct(product);
    // 	res.status(200).json({ message: "Product updated successfully" });
    // } catch (error: any) {
    // 	next(error);
    // }
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