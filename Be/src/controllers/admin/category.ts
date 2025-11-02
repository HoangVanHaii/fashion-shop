import { Request, Response, NextFunction } from "express";
import * as categoryService from "../../services/category";
import { Category } from "../../interfaces/category";
import { AppError } from "../../utils/appError";
import redisClient from "../../config/redisClient";

export const addCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== "admin") {
            throw new AppError("You do not have permission to add category", 403);
        }

        const { category_name, description, status, gender } = req.body;
        const newCategory = {
            category_name,
            description,
            status,
            gender
        } as Category;

        await categoryService.addCategory(newCategory);
        const cacheKey = "category:active";
        await redisClient.del(cacheKey);
        res.status(201).json({ message: "Category added successfully" });
    } catch (error) {
        next(error);
    }
};


export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== "admin") {
            throw new AppError("You do not have permission to add category", 403);
        }

        const categoryId = parseInt(req.params.id);

        const existingCategory = await categoryService.getCategoryById(categoryId);
        if (!existingCategory) {
            throw new AppError("Category not found", 404);
        }

        const { category_name, description, status, gender } = req.body;

        const updatedCategory = {
            category_id: categoryId,
            category_name,
            description,
            status,
            gender
        } as Category;

        await categoryService.updateCategory(updatedCategory);
        const cacheKey = "category:active";
        await redisClient.del(cacheKey);
        res.status(200).json({ message: "Category updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== "admin") {
            throw new AppError("You do not have permission to add category", 403);
        }

        const categoryId = parseInt(req.params.id);

        const existingCategory = await categoryService.getCategoryById(categoryId);
        if (!existingCategory) {
            throw new AppError("Category not found", 404);
        }

        await categoryService.deleteCategory(categoryId);
        const cacheKey = "category:active";
        await redisClient.del(cacheKey);
        res.status(200).json({ message: "Category deleted (set inactive) successfully" });
    } catch (error) {
        next(error);
    }
};
