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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.addCategory = void 0;
const categoryService = __importStar(require("../../services/category"));
const appError_1 = require("../../utils/appError");
const addCategory = async (req, res, next) => {
    try {
        if (req.user?.role !== "admin") {
            throw new appError_1.AppError("You do not have permission to add category", 403);
        }
        const { category_name, description, status, gender } = req.body;
        const newCategory = {
            category_name,
            description,
            status,
            gender
        };
        await categoryService.addCategory(newCategory);
        res.status(201).json({ message: "Category added successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.addCategory = addCategory;
const updateCategory = async (req, res, next) => {
    try {
        if (req.user?.role !== "admin") {
            throw new appError_1.AppError("You do not have permission to add category", 403);
        }
        const categoryId = parseInt(req.params.id);
        const existingCategory = await categoryService.getCategoryById(categoryId);
        if (!existingCategory) {
            throw new appError_1.AppError("Category not found", 404);
        }
        const { category_name, description, status, gender } = req.body;
        const updatedCategory = {
            category_id: categoryId,
            category_name,
            description,
            status,
            gender
        };
        await categoryService.updateCategory(updatedCategory);
        res.status(200).json({ message: "Category updated successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    try {
        if (req.user?.role !== "admin") {
            throw new appError_1.AppError("You do not have permission to add category", 403);
        }
        const categoryId = parseInt(req.params.id);
        const existingCategory = await categoryService.getCategoryById(categoryId);
        if (!existingCategory) {
            throw new appError_1.AppError("Category not found", 404);
        }
        await categoryService.deleteCategory(categoryId);
        res.status(200).json({ message: "Category deleted (set inactive) successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
