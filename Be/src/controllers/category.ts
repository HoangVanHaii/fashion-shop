import { Request, Response, NextFunction } from "express";
import * as categoryService from "../services/category";
import { AppError } from "../utils/appError";
import redisClient from "../config/redisClient";

export const getAllActiveCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await categoryService.getAllActiveCategories();
        res.json({
            success: true,
            message: "Get active categories successfully",
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

export const getCategoryNameByGender = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const gender = req.query.gender as string;
        if (!gender) {
            return res.status(400).json({
                success: false,
                message: "Missing gender parameter",
            });
        }

        const cacheKey = `category:name:${gender}`;
        const cachedData = await redisClient.get(cacheKey);

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
            await redisClient.setEx(cacheKey, 300, JSON.stringify(categoryNames));
            console.log("Cache miss → saved new data");
        }

        res.json({
            success: true,
            message: "Get category names successfully",
            data: categoryNames,
        });

    } catch (error) {
        next(error);
    }
};

export const getAllInactiveCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await categoryService.getAllInactiveCategories();
        res.json({
            success: true,
            message: "Get inactive categories successfully",
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categoryId = parseInt(req.params.id);

        const category = await categoryService.getCategoryById(categoryId);

        if (!category) {
            throw new AppError("Category not found", 404);
        }

        res.json({
            success: true,
            message: "Get category successfully",
            data: category
        });
    } catch (error) {
        next(error);
    }
};
