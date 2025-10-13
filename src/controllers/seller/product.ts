import * as productService from "../../services/product";
import { ProductPayload, ProductColor, ProductSize } from "../../interfaces/product";
import { Request, Response, NextFunction } from "express";
import *as userService from '../../services/user'

export const getAllProductsByShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shop_id = await userService.getShopIdByUserId(req.user!.id);
        const products = await productService.getAllProductsByShop(shop_id);
        res.status(200).json(products);
    } catch (error: any) {
        next(error);
    }
}
export const getAllProductsHiddenByShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shop_id = await userService.getShopIdByUserId(req.user!.id);
        const products = await productService.getAllProductsHiddenByShop(shop_id);
        res.status(200).json(products);
    } catch (error: any) {
        next(error);
    }
}
export const addProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category_id, name, description, colors } = req.body;
        const shop_id = await userService.getShopIdByUserId(req.user!.id);
        
        const files = req.files as Express.Multer.File[];
        const parseColors = JSON.parse(colors);

        let productColors: ProductColor[] = [];
        let indexImage = 0;
        for(let i = 0; i < parseColors.length ; i++){
            const color = parseColors[i];
            const start = 4 * i;
            const end = 4 * i + 3
            const image = files[start];
            let color_images: string[] = [];
            for(let j = start + 1; j <= end; j++){
                color_images.push(`/uploads/products/${files[j].filename}`)
            }
            let productSizes: ProductSize[] = [];
            for(const size of color.sizes){
                productSizes.push({size: size.size, stock: size.stock, price: size.price});
            }
            productColors.push({
                color: color.color, 
                image_url: `/uploads/products/${image.filename}`,
                is_main: i == 0,
                sizes: productSizes,
                images: color_images
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
export const updateProduct = async (req: Request, res: Response, next: NextFunction) =>{
  try {
    const productId = parseInt(req.params.id);
    const existingProduct = await productService.getProductById(productId);

    const { shop_id, category_id, name, description, colors } = req.body;
    const files = req.files as Express.Multer.File[];
    let fileIndex = 0;
    const parseColors = JSON.parse(colors);

    let finalColors: ProductColor[] = [];
    for(const oldColor of existingProduct.colors){
      const newColor = parseColors.find(
        (c: any) => c.id === oldColor.id || c.color === oldColor.color
      );

      if(newColor){
        //xử lý ảnh
        let imageUrl = oldColor.image_url
        if (newColor.newImage && files[fileIndex]) {
          imageUrl = `/uploads/products/${files[fileIndex].filename}`;
          fileIndex++;
         }

        // xử lý sizes
        let updatedSizes: ProductSize[] = [];
        for (const oldSize of oldColor.sizes) {
          const newSize = newColor.sizes.find((s: any) => s.id === oldSize.id);
          updatedSizes.push({
            id: oldSize.id,
            size: newSize?.size || oldSize.size,
            stock: newSize?.stock ?? oldSize.stock,
            price: newSize?.price ?? oldSize.price,
          });
        }

        // thêm size mới hoàn toàn
        const newSizes = newColor.sizes.filter((s: any) => !s.id);
        for (const s of newSizes) {
          updatedSizes.push({
            size: s.size,
            stock: s.stock,
            price: s.price,
          });
        }

        finalColors.push({
          id: oldColor.id,
          product_id: oldColor.product_id,
          color: newColor.color || oldColor.color,
          image_url: imageUrl,
          is_main: newColor.is_main ?? oldColor.is_main,
          sizes: updatedSizes,
        });
      }else {
        // giữ nguyên color cũ nếu không gửi lên
        finalColors.push(oldColor);
      } 
    }
    // thêm color mới hoàn toàn
    const newColors = parseColors.filter(
      (c: any) => !c.id && !existingProduct.colors.some(ec => ec.color === c.color)
    );
    for (const c of newColors) {
      const imageUrl = `/uploads/products/${files[fileIndex].filename}`;
      fileIndex++;

      finalColors.push({
        color: c.color,
        image_url: imageUrl,
        is_main: c.is_main ?? false,
        sizes: c.sizes,
      });
    }

    // Ghép 
    const finalProduct: ProductPayload = {
      id: productId,
      shop_id: existingProduct.shop_id,
      category_id: Number(category_id) || existingProduct.category_id,
      name: name || existingProduct.name,
      description: description || existingProduct.description,
      status: existingProduct.status,
      colors: finalColors,
      flash_sale_price: existingProduct.flash_sale_price,
    };

    await productService.updateProduct(finalProduct);

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error:any) {
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