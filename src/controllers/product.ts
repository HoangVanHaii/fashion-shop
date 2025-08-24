import * as productService from "../services/product";
import { Product } from "../interfaces/product";
import { Request, Response } from "express";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
export const addProduct = async (req: Request, res: Response) => {
  try {
    const {shop_id, category_id, name, description, price, stock} = req.body;
    const product = {shop_id, category_id, name, description, price, stock} as Product;

    await productService.addProduct(product);
    res.status(201).json({ message: "Product added successfully" });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const {id, shop_id, category_id, name, description, price, stock, status} = req.body;
    const product = {id, shop_id, category_id, name, description, price, stock, status} as Product;
    await productService.updateProduct(product);
    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
export const getProductById = async (req: Request, res: Response) => {
  try {
    let id: number = parseInt(req.params.id);
    const products = await productService.getProductById(id);
    if (products == null) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(products);  
  } catch (error) {
    console.log("Error fetching product by ID:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
}
export const getProductByName = async (req: Request, res: Response) => {
  try {
    const name: string = req.query.name as string;
    const products = await productService.getProductByName(name);
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found with given name" });
    }
    res.status(200).json(products);
  } catch (error) {
    console.log("Erorr fetching product by name:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
}
export const softDeleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    await productService.softDeleteProduct(id);
    res.status(200).json({ message: "Product soft-deleting successfully" });
  } catch (error) {
    console.error("Error soft-deleting product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
export const getProductsActive = async (req: Request, res: Response) => {
  try {
    const products = await productService.getProductsActive();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching active products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
export const getLatestProducts = async (req: Request, res: Response) => {
  try {
    const limit: number = parseInt(req.query.limit as string) || 10;
    const products = await productService.getLatestProducts(limit);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching latest products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
export const getProductByShop = async(req: Request, res: Response) => {
  try {
    const shop_id:number = parseInt(req.query.shop_id as string);
    const products = await productService.getProductByShop(shop_id);
    res.status(200).json(products);
  } catch (error) {
    console.log("Error fetching products by shop")
    res.status(500).send({ message:"Internal Server Erorr" });
  }
} 
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const category_id: number = parseInt( req.query.category_id as string)
    const products = await productService.getProductsByCategory(category_id);
    res.status(200).json(products);
  } catch (error) {
    console.log("Error fetching products by category");
    res.status(500).send({ message: "Internal Server Error"});
  }
}
export const getBestSellerProduct = async (req: Request, res: Response) => {
  try {
    let limit: number = parseInt(req.query.limit as string);
    const products = await productService.getBestSellerProduct(limit);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Erorr"});
  }
}
export const getMostDiscountedProduct = async (req: Request, res: Response) => {
  try {
    let limit: number = parseInt(req.query.limit as string);
    const products = await productService.getMostDiscountedProduct(limit);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Erorr"});
  }
}
