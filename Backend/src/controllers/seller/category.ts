import { Request, Response, NextFunction } from "express";
import * as categoryService from "../../services/category";
import { Category } from "../../interfaces/category";
import { AppError } from "../../utils/appError";

export const addCategorySeller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== "seller") {
      throw new AppError("You do not have permission to add category", 403);
    }

    const { category_name, description } = req.body;

    const newCategory = {
      category_name,
      description,
      status: "inactive"
    } as Category;

    await categoryService.addCategory(newCategory);

    res.status(201).json({ message: "Category added successfully and wait for admin to process" });
  } catch (error) {
    next(error);
  }
};
