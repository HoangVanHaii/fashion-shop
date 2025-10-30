"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.softDeleteProduct = exports.updateProduct = exports.addProduct = exports.getAllProductsHiddenByShop = exports.getAllProductsByShop = exports.updateSizes = exports.updateProductStatus = void 0;
const productService = __importStar(require("../../services/product"));
const redisClient_1 = __importDefault(require("../../config/redisClient"));
const userService = __importStar(require("../../services/user"));
const updateProductStatus = async (req, res, next) => {
    try {
        const { status, product_id } = req.body;
        await productService.updateProductStatus(product_id, String(status));
        try {
            const shop_id = await userService.getShopIdByUserId(req.user.id);
            const cacheKey = `shop:products:${shop_id}`;
            await redisClient_1.default.del(cacheKey);
            console.log('Đã xóa redis');
        }
        catch (err) {
            console.warn("Cache invalidate error:", err);
        }
        res.status(200).json({ message: "Product status updated successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProductStatus = updateProductStatus;
const updateSizes = async (req, res, next) => {
    try {
        const { sizes, stock } = req.body;
        await productService.updateSizes(sizes, Number(stock));
        try {
            const shop_id = await userService.getShopIdByUserId(req.user.id);
            const cacheKey = `shop:products:${shop_id}`;
            await redisClient_1.default.del(cacheKey);
            console.log('Đã xóa redis');
        }
        catch (err) {
            console.warn("Cache invalidate error:", err);
        }
        res.status(200).json({ message: "Product izes updated successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSizes = updateSizes;
const getAllProductsByShop = async (req, res, next) => {
    try {
        const shop_id = await userService.getShopIdByUserId(req.user.id);
        const cacheKey = `shop:products:${shop_id}`;
        const cached = await redisClient_1.default.get(cacheKey);
        let products;
        if (cached) {
            console.log('cache hit');
            products = JSON.parse(cached);
        }
        else {
            products = await productService.getProductPayloadOfShop(shop_id);
            try {
                await redisClient_1.default.set(cacheKey, JSON.stringify(products), { EX: 3000 });
                console.log('cache mis -> saved new data');
            }
            catch (err) {
                console.warn("Redis set error:", err);
            }
        }
        res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllProductsByShop = getAllProductsByShop;
const getAllProductsHiddenByShop = async (req, res, next) => {
    try {
        const shop_id = await userService.getShopIdByUserId(req.user.id);
        const products = await productService.getAllProductsHiddenByShop(shop_id);
        res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllProductsHiddenByShop = getAllProductsHiddenByShop;
const addProduct = async (req, res, next) => {
    try {
        const { category_id, name, description, colors } = req.body;
        const shop_id = await userService.getShopIdByUserId(req.user.id);
        const files = req.files;
        const parseColors = JSON.parse(colors);
        let productColors = [];
        let indexImage = 0;
        for (let i = 0; i < parseColors.length; i++) {
            const color = parseColors[i];
            const start = 4 * i;
            const end = 4 * i + 3;
            const image = files[start];
            let color_images = [];
            for (let j = start + 1; j <= end; j++) {
                color_images.push(`/uploads/products/${files[j].filename}`);
            }
            let productSizes = [];
            for (const size of color.sizes) {
                productSizes.push({
                    size: size.size,
                    stock: size.stock,
                    price: size.price
                });
            }
            productColors.push({
                color: color.color,
                image_url: `/uploads/products/${image.filename}`,
                is_main: i == 0,
                sizes: productSizes,
                images: color_images
            });
        }
        const productPayload = {
            shop_id: Number(shop_id),
            category_id: Number(category_id),
            name: String(name),
            description: String(description),
            colors: productColors
        };
        await productService.addProduct(productPayload);
        res.status(201).json({ message: "Product added successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.addProduct = addProduct;
const updateProduct = async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id);
        const existingProduct = await productService.getProductById(productId);
        const { category_id, name, description, colors } = req.body;
        const files = req.files;
        let fileIndex = 0;
        const parseColors = JSON.parse(colors);
        let finalColors = [];
        for (const oldColor of existingProduct.colors) {
            const newColor = parseColors.find((c) => c.id === oldColor.id || c.color === oldColor.color);
            if (newColor) {
                let mainImage = oldColor.image_url;
                let imageList = oldColor.images || [];
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
                let updatedSizes = [];
                for (const oldSize of oldColor.sizes) {
                    const newSize = newColor.sizes.find((s) => s.id === oldSize.id || s.size === oldSize.size);
                    updatedSizes.push({
                        id: oldSize.id,
                        size: newSize?.size || oldSize.size,
                        stock: newSize?.stock ?? oldSize.stock,
                        price: newSize?.price ?? oldSize.price,
                    });
                }
                // thêm size mới hoàn toàn
                const newSizes = newColor.sizes.filter((s) => !s.id && !oldColor.sizes.some((os) => os.size === s.size));
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
            }
            else {
                finalColors.push(oldColor);
            }
        }
        // thêm color mới hoàn toàn
        const newColors = parseColors.filter((c) => !c.id && !existingProduct.colors.some(ec => ec.color === c.color));
        for (const c of newColors) {
            const start = fileIndex;
            const end = start + 3;
            const mainImage = `/uploads/products/${files[start].filename}`;
            const imageList = [];
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
        const finalProduct = {
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
    }
    catch (error) {
        console.log(error);
        next(error);
    }
};
exports.updateProduct = updateProduct;
const softDeleteProduct = async (req, res, next) => {
    try {
        const { id } = req.body;
        await productService.softDeleteProduct(id);
        res.status(200).json({ message: "Product soft-deleting successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.softDeleteProduct = softDeleteProduct;
