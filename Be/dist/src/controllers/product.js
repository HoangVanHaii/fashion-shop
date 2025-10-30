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
exports.getProductSizesBySize = exports.getProductIdBySize = exports.getMostDiscountedProduct = exports.getBestSellerProduct = exports.getLatestProducts = exports.getProductByCategoryGender = exports.getProductsByCategory = exports.getProductByShop = exports.getProductByName = exports.getProductById = exports.getProductsActive = void 0;
const productService = __importStar(require("../services/product"));
const redisClient_1 = __importDefault(require("../config/redisClient"));
const getProductsActive = async (req, res, next) => {
    try {
        const cacheKey = 'products:active';
        const cachedData = await redisClient_1.default.get(cacheKey);
        if (cachedData) {
            console.log("Cache hit");
            return res.status(200).json(JSON.parse(cachedData));
        }
        const products = await productService.getProductsActive();
        await redisClient_1.default.setEx(cacheKey, 300, JSON.stringify(products));
        console.log("Cache miss → saved new data");
        res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
};
exports.getProductsActive = getProductsActive;
const getProductById = async (req, res, next) => {
    try {
        let id = parseInt(req.params.id);
        const products = await productService.getProductById(id);
        if (products == null) {
            return res.status(200).send({ message: "Product not found" });
        }
        res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
};
exports.getProductById = getProductById;
const getProductByName = async (req, res, next) => {
    try {
        const name = req.query.name;
        const products = await productService.getProductByName(name);
        if (products.length === 0) {
            return res.status(200).json({ message: "No products found with the given name" });
        }
        res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
};
exports.getProductByName = getProductByName;
const getProductByShop = async (req, res, next) => {
    try {
        const shop_id = parseInt(req.query.shop_id);
        const products = await productService.getProductByShop(shop_id);
        res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
};
exports.getProductByShop = getProductByShop;
const getProductsByCategory = async (req, res, next) => {
    try {
        const categoryNames = req.query.categoryNames;
        const categoryArray = categoryNames.split(',').map(name => {
            const trimmedName = name.trim();
            return `N'${trimmedName}'`;
        });
        const arrayName = categoryArray.join(', ');
        const products = await productService.getProductsByCategory(arrayName);
        res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
};
exports.getProductsByCategory = getProductsByCategory;
const getProductByCategoryGender = async (req, res, next) => {
    try {
        const gender = req.query.gender;
        const products = await productService.getProductByCategoryGender(gender);
        res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
};
exports.getProductByCategoryGender = getProductByCategoryGender;
const getLatestProducts = async (req, res, next) => {
    try {
        let limit = parseInt(req.query.limit);
        const cacheKey = `LatestProductTop${limit}`;
        const cachedData = await redisClient_1.default.get(cacheKey);
        if (cachedData) {
            console.log("Cache hit Latest Products");
            const products = JSON.parse(cachedData);
            return res.status(200).json(products);
        }
        const products = await productService.getLatestProducts(limit);
        await redisClient_1.default.setEx(cacheKey, 600, JSON.stringify(products));
        return res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
};
exports.getLatestProducts = getLatestProducts;
const getBestSellerProduct = async (req, res, next) => {
    try {
        let limit = parseInt(req.query.limit);
        const cacheKey = `BestSellerTop${limit}`;
        const cachedData = await redisClient_1.default.get(cacheKey);
        if (cachedData) {
            console.log("Cache hit BestSeller");
            const products = JSON.parse(cachedData);
            return res.status(200).json(products);
        }
        const products = await productService.getBestSellerProduct(limit);
        await redisClient_1.default.setEx(cacheKey, 600, JSON.stringify(products));
        return res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
};
exports.getBestSellerProduct = getBestSellerProduct;
const getMostDiscountedProduct = async (req, res, next) => {
    try {
        let limit = parseInt(req.query.limit);
        const products = await productService.getMostDiscountedProduct(limit);
        res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
};
exports.getMostDiscountedProduct = getMostDiscountedProduct;
const getProductIdBySize = async (req, res, next) => {
    try {
        const size_id = parseInt(req.params.id);
        if (isNaN(size_id)) {
            return res.status(400).json({ message: "Invalid size_id" });
        }
        const product_id = await productService.getProductIdBySizeId(size_id);
        res.status(200).json({ product_id });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductIdBySize = getProductIdBySize;
const getProductSizesBySize = async (req, res, next) => {
    try {
        const size_id = parseInt(req.params.id);
        if (isNaN(size_id)) {
            return res.status(400).json({ message: "Invalid size_id" });
        }
        const sizeData = await productService.getProductSizesBySizeId(size_id);
        res.status(200).json(sizeData);
    }
    catch (error) {
        next(error);
    }
};
exports.getProductSizesBySize = getProductSizesBySize;
