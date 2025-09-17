// controllers/categoryController.ts
import { Request, Response, NextFunction } from "express";
import * as categoryService from "../services/categories";
import { Category } from "../interfaces/categories";
import { AppError } from "../utils/appError";

export const addCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== "admin") {
      throw new AppError("You do not have permission to add category", 403);
    }

    const { category_name, description, status } = req.body;

    if (!category_name) {
      throw new AppError("Category name is required", 400);
    }

    const newCategory = {
      category_name,
      description,
      status
    } as Category;

    await categoryService.addCategory(newCategory);

    res.status(201).json({ message: "Category added successfully" });
  } catch (error) {
    next(error);
  }
};

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

    const { category_name, description, status } = req.body;

    const updatedCategory = {
      category_id: categoryId,
      category_name,
      description,
      status,
    } as Category;

    await categoryService.updateCategory(updatedCategory);
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

    res.status(200).json({ message: "Category deleted (set inactive) successfully" });
  } catch (error) {
    next(error);
  }
};
