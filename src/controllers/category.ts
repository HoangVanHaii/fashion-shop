import { Request, Response, NextFunction } from "express";
import * as categoryService from "../services/category";
import { AppError } from "../utils/appError";

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
        const categoryNames = await categoryService.getCategoryNamByGender(gender);
        res.json({
            success: true,
            message: "Get category names successfully",
            data: categoryNames
        });

    } catch (error) {
        next(error);
    }
}

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
