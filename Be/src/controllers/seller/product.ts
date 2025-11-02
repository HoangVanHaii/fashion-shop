import * as productService from "../../services/product";
import { ProductPayload, ProductColor, ProductSize } from "../../interfaces/product";
import { Request, Response, NextFunction } from "express";
import redisClient from "../../config/redisClient";
import *as userService from '../../services/user'
export const updateProductStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status, product_id } = req.body;
        await productService.updateProductStatus(product_id, String(status));
        try {
            const shop_id = await userService.getShopIdByUserId(req.user!.id);
            const cacheKey = `shop:products:${shop_id}`;
            await redisClient.del(cacheKey);
            console.log('Đã xóa redis');
        } catch (err) {
            console.warn("Cache invalidate error:", err);
        }

        res.status(200).json({ message: "Product status updated successfully" });
    } catch (error: any) {
        next(error);
    }
};
export const updateSizes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sizes, stock } = req.body;
        await productService.updateSizes(sizes, Number(stock));
        try {
            const shop_id = await userService.getShopIdByUserId(req.user!.id);
            const cacheKey = `shop:products:${shop_id}`;
            await redisClient.del(cacheKey);
            console.log('Đã xóa redis');
        } catch (err) {
            console.warn("Cache invalidate error:", err);
        }

        res.status(200).json({ message: "Product izes updated successfully" });
    } catch (error: any) {
        next(error);
    }
};
export const getAllProductsByShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shop_id = await userService.getShopIdByUserId(req.user!.id);
        const cacheKey = `shop:products:${shop_id}`;
        const cached = await redisClient.get(cacheKey);
        let products: any;
        if (cached) {
            console.log('cache hit');
            products = JSON.parse(cached);
        } else {
            products = await productService.getProductPayloadOfShop(shop_id);
            try {
                await redisClient.set(cacheKey, JSON.stringify(products), { EX: 3000 });
                console.log('cache mis -> saved new data')
            } catch (err) {
                console.warn("Redis set error:", err);
            }
        }
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
    console.log(8878);
    console.log("ssss", req.body);
    try {
        const { category_id, name, description, colors } = req.body;
        const shop_id = await userService.getShopIdByUserId(req.user!.id);

        const parseColors = JSON.parse(colors);
        let productColors: ProductColor[] = [];

        for (let i = 0; i < parseColors.length; i++) {
            const color = parseColors[i];

            let productSizes: ProductSize[] = color.sizes.map((s: any) => ({
                size: s.size,
                stock: s.stock,
                price: s.price
            }));

            productColors.push({
                color: color.color,
                image_url: color.image_url,
                is_main: i === 0,
                sizes: productSizes,
                images: color.images
            });
        }

        const productPayload: ProductPayload = {
            shop_id,
            category_id,
            name,
            description,
            colors: productColors
        };

        await productService.addProduct(productPayload);

        return res.status(201).json({ message: "Product created successfully" });

    } catch (error: any) {
        console.log(error);
        next(error);
    }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = parseInt(req.params.id);
        const existingProduct = await productService.getProductById(productId);

        const { category_id, name, description, colors } = req.body;
        const files = req.files as Express.Multer.File[];
        let fileIndex = 0;
        const parseColors = JSON.parse(colors);

        let finalColors: ProductColor[] = [];
        for (const oldColor of existingProduct.colors) {
            const newColor = parseColors.find(
                (c: any) => c.id === oldColor.id || c.color === oldColor.color
            );

            if (newColor) {
                let mainImage = oldColor.image_url;
                let imageList: string[] = oldColor.images || [];
                //xử lý ảnh
                if (newColor.newImage && files[fileIndex]) {
                    const start = fileIndex;
                    const end = start + 3;
                    //mainImage 
                    const mainImageFile = files[start];
                    mainImage = `/uploads/products/${mainImageFile.filename}`;

                    imageList = [];
                    for (let j = start + 1; j <= end; j++) {
                        imageList.push(`/uploads/products/${files[j].filename}`);
                    }

                    fileIndex += 4; // dịch sang bộ ảnh tiếp theo
                }

                // xử lý sizes
                let updatedSizes: ProductSize[] = [];
                for (const oldSize of oldColor.sizes) {
                    const newSize = newColor.sizes.find((s: any) => s.id === oldSize.id || s.size === oldSize.size);
                    updatedSizes.push({
                        id: oldSize.id,
                        size: newSize?.size || oldSize.size,
                        stock: newSize?.stock ?? oldSize.stock,
                        price: newSize?.price ?? oldSize.price,
                    });
                }

                // thêm size mới hoàn toàn
                const newSizes = newColor.sizes.filter((s: any) => !s.id && !oldColor.sizes.some((os: any) => os.size === s.size)
                );
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
                    image_url: mainImage,
                    is_main: newColor.is_main ?? oldColor.is_main,
                    images: imageList,
                    sizes: updatedSizes,
                });
            } else {
                finalColors.push(oldColor);
            }
        }
        // thêm color mới hoàn toàn
        const newColors = parseColors.filter(
            (c: any) => !c.id && !existingProduct.colors.some(ec => ec.color === c.color)
        );
        for (const c of newColors) {
            const start = fileIndex;
            const end = start + 3;
            const mainImage = `/uploads/products/${files[start].filename}`;
            const imageList: string[] = [];

            for (let j = start + 1; j <= end; j++) {
                imageList.push(`/uploads/products/${files[j].filename}`);
            }

            fileIndex += 4;

            finalColors.push({
                color: c.color,
                image_url: mainImage,
                is_main: c.is_main ?? false,
                images: imageList,
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
        };

        await productService.updateProduct(finalProduct);

        res.status(200).json({ message: "Product updated successfully" });
    } catch (error: any) {
        console.log(error)
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