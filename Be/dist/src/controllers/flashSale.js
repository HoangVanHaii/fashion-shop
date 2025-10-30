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
exports.removeFlashSaleItem = exports.updateFlashSaleItem = exports.addFlashSaleItem = exports.cancelAllFlashSaleItemsForSeller = exports.cancelFlashSale = exports.updateFlashSales = exports.getTotalSoldFlashSaleById = exports.getFlashSaleHotDeal = exports.getFlashSaleHome = exports.getFlashSaleById = exports.getAllFlashSaleForSeller = exports.getAllFlashSaleDetails = exports.getAllFlashSales = exports.createFlashSale = void 0;
const FlashSaleService = __importStar(require("../services/flashSale"));
const appError_1 = require("../utils/appError");
const redisClient_1 = __importDefault(require("../config/redisClient"));
const user_1 = require("../services/user");
const createFlashSale = async (req, res, next) => {
    try {
        const { title, startDate, endDate } = req.body;
        const created_by = req.user.id;
        const flashSale = { title, start_date: startDate, end_date: endDate, created_by };
        const flash_sale_id = await FlashSaleService.createFlashSale(flashSale);
        return res.status(201).json({
            success: true,
            message: 'Flash sale created successfully',
            data: flash_sale_id
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createFlashSale = createFlashSale;
const getAllFlashSales = async (req, res, next) => {
    try {
        const shop_id = await (0, user_1.getShopIdByUserId)(req.user?.id);
        const status = req.query.status;
        const flashSales = await FlashSaleService.getAllFlashSalesByStatus(status, shop_id);
        return res.status(200).json({
            success: true,
            message: 'Get all flash sales successfully',
            data: flashSales
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllFlashSales = getAllFlashSales;
const getAllFlashSaleDetails = async (req, res, next) => {
    try {
        const status = req.query.status;
        const flashSales = await FlashSaleService.getAllFlashSaleDetails(status);
        return res.status(200).json({
            success: true,
            message: 'Get all flash sales successfully',
            data: flashSales
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllFlashSaleDetails = getAllFlashSaleDetails;
const getAllFlashSaleForSeller = async (req, res, next) => {
    try {
        const status = req.query.status;
        const user_id = req.user.id;
        const flashSales = await FlashSaleService.getAllFlashSaleForSeller(user_id, status);
        return res.status(200).json({
            success: true,
            message: 'Get all flash sales successfully',
            data: flashSales
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllFlashSaleForSeller = getAllFlashSaleForSeller;
const getFlashSaleById = async (req, res, next) => {
    try {
        const flash_sale_id = parseInt(req.params.id);
        const flashSale = await FlashSaleService.getFlashSaleById(flash_sale_id);
        if (!flashSale) {
            throw new appError_1.AppError('Flash sale not found', 404, false);
        }
        return res.status(200).json({
            success: true,
            message: 'Get flash sale by id successfully',
            data: flashSale
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getFlashSaleById = getFlashSaleById;
const getFlashSaleHome = async (req, res, next) => {
    try {
        // const cacheKey = `FlashSaleHome`;
        // const cachedData = await redisClient.get(cacheKey);
        // if (cachedData) {
        //     console.log("Cache hit FlashSaleHome")
        //     const data = JSON.parse(cachedData);
        //     return res.status(200).json({
        //         success: true,
        //         message: 'Get flash sale (from cache) successfully',
        //         ...data
        //     });
        // }
        const { flash_sale, products } = await FlashSaleService.getFlashSaleHome();
        const dataToCache = { flash_sale, products };
        // await redisClient.setEx(cacheKey, 600, JSON.stringify(dataToCache));
        return res.status(200).json({
            success: true,
            message: 'Get flash sale by id successfully',
            flash_sale,
            products
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getFlashSaleHome = getFlashSaleHome;
const getFlashSaleHotDeal = async (req, res, next) => {
    try {
        const excludeIdsParam = req.query.excludeIds;
        const excludeIds = excludeIdsParam
            ? excludeIdsParam
                .split(",")
                .map((id) => parseInt(id.trim(), 10))
                .filter((num) => Number.isFinite(num))
            : [];
        const cacheKey = `FlashSaleDealHotNotId${excludeIds}`;
        const cachedData = await redisClient_1.default.get(cacheKey);
        if (cachedData) {
            console.log(`Cache hit FlashSaleDe${cacheKey}`);
            const data = JSON.parse(cachedData);
            return res.status(200).json({
                success: true,
                message: 'Get flash sale (from cache) successfully',
                ...data
            });
        }
        const { flash_sale, products } = await FlashSaleService.getFlashSaleHotDeal(excludeIds);
        const dataToCache = { flash_sale, products };
        await redisClient_1.default.setEx(cacheKey, 600, JSON.stringify(dataToCache));
        return res.status(200).json({
            success: true,
            message: 'Get flash sale by id successfully',
            flash_sale,
            products
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getFlashSaleHotDeal = getFlashSaleHotDeal;
const getTotalSoldFlashSaleById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Flash sale id is required",
            });
        }
        const result = await FlashSaleService.getTotalSoldFlashSaleById(id);
        return res.status(200).json({
            success: true,
            message: "Get total sold by flash sale successfully",
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getTotalSoldFlashSaleById = getTotalSoldFlashSaleById;
const updateFlashSales = async (req, res, next) => {
    try {
        const flash_sale_id = parseInt(req.params.id);
        const { title, startDate, endDate, status } = req.body;
        const created_by = req.user.id;
        const role = req.user.role;
        const flashSale = { id: flash_sale_id, title, start_date: startDate, end_date: endDate, status, created_by };
        await FlashSaleService.updateFlashSale(flashSale);
        return res.status(200).json({
            success: true,
            message: 'Update flash sale successfully'
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateFlashSales = updateFlashSales;
const cancelFlashSale = async (req, res, next) => {
    try {
        const flash_sale_id = parseInt(req.params.id);
        const user_id = req.user.id;
        const role = req.user.role;
        await FlashSaleService.cancelFlashSaleForAdmin(flash_sale_id);
        return res.status(200).json({
            success: true,
            message: 'Cancel flash sale successfully'
        });
    }
    catch (err) {
        next(err);
    }
};
exports.cancelFlashSale = cancelFlashSale;
const cancelAllFlashSaleItemsForSeller = async (req, res, next) => {
    try {
        const flash_sale_id = parseInt(req.params.id);
        const user_id = req.user.id;
        const shop_id = await (0, user_1.getShopIdByUserId)(user_id);
        await FlashSaleService.cancelAllFlashSaleItemsForSeller(shop_id, flash_sale_id);
        return res.status(200).json({
            success: true,
            message: 'Cancel flash sale successfully'
        });
    }
    catch (err) {
        next(err);
    }
};
exports.cancelAllFlashSaleItemsForSeller = cancelAllFlashSaleItemsForSeller;
const addFlashSaleItem = async (req, res, next) => {
    try {
        const flashSaleId = parseInt(req.params.id);
        const { items } = req.body;
        const item = items;
        const user_id = req.user.id;
        const flash_sale_item_id = await FlashSaleService.addItemToFlashSale(user_id, flashSaleId, item);
        return res.status(201).json({
            success: true,
            message: 'Flash sale item added successfully',
            data: flash_sale_item_id
        });
    }
    catch (err) {
        next(err);
    }
};
exports.addFlashSaleItem = addFlashSaleItem;
const updateFlashSaleItem = async (req, res, next) => {
    try {
        const flash_sale_item_id = parseInt(req.params.id);
        const { flash_sale_price, stock } = req.body;
        const user_id = req.user.id;
        const item = { id: flash_sale_item_id, flash_sale_price, stock };
        await FlashSaleService.updateFlashSaleItem(user_id, item);
        return res.status(200).json({
            success: true,
            message: 'Update flash sale item successfully'
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateFlashSaleItem = updateFlashSaleItem;
const removeFlashSaleItem = async (req, res, next) => {
    try {
        const flash_sale_item_id = parseInt(req.params.id);
        const user_id = req.user.id;
        const role = req.user.role;
        await FlashSaleService.removeFlashSaleItem(user_id, flash_sale_item_id);
        return res.status(200).json({
            success: true,
            message: 'Remove flash sale item successfully'
        });
    }
    catch (err) {
        next(err);
    }
};
exports.removeFlashSaleItem = removeFlashSaleItem;
