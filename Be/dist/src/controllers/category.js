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
exports.getCategoryById = exports.getAllInactiveCategories = exports.getCategoryNameByGender = exports.getAllActiveCategories = void 0;
const categoryService = __importStar(require("../services/category"));
const appError_1 = require("../utils/appError");
const redisClient_1 = __importDefault(require("../config/redisClient"));
const getAllActiveCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllActiveCategories();
        res.json({
            success: true,
            message: "Get active categories successfully",
            data: categories
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllActiveCategories = getAllActiveCategories;
const getCategoryNameByGender = async (req, res, next) => {
    try {
        const gender = req.query.gender;
        if (!gender) {
            return res.status(400).json({
                success: false,
                message: "Missing gender parameter",
            });
        }
        const cacheKey = `category:name:${gender}`;
        const cachedData = await redisClient_1.default.get(cacheKey);
        if (cachedData) {
            console.log("Cache hit");
            return res.status(200).json({
                success: true,
                message: "Get category names successfully (from cache)",
                data: JSON.parse(cachedData),
            });
        }
        const categoryNames = await categoryService.getCategoryNamByGender(gender);
        if (categoryNames && categoryNames.length > 0) {
            await redisClient_1.default.setEx(cacheKey, 3000, JSON.stringify(categoryNames));
            console.log("Cache miss → saved new data");
        }
        res.json({
            success: true,
            message: "Get category names successfully",
            data: categoryNames,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryNameByGender = getCategoryNameByGender;
const getAllInactiveCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllInactiveCategories();
        res.json({
            success: true,
            message: "Get inactive categories successfully",
            data: categories
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllInactiveCategories = getAllInactiveCategories;
const getCategoryById = async (req, res, next) => {
    try {
        const categoryId = parseInt(req.params.id);
        const category = await categoryService.getCategoryById(categoryId);
        if (!category) {
            throw new appError_1.AppError("Category not found", 404);
        }
        res.json({
            success: true,
            message: "Get category successfully",
            data: category
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryById = getCategoryById;
