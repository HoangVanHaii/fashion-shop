// validators/categoryValidator.ts
import { body, param } from "express-validator";

export const addCategoryValidator = [
  body("category_name")
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ max: 100 })
    .withMessage("Category name must not exceed 100 characters"),

  body("description")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Description must not exceed 255 characters"),

  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either 'active' or 'inactive'"),
  body("gender")
    .optional()
    .isIn(["Nam", "Nữ"]).withMessage("Gender is in Nam or Nu")
];

export const updateCategoryValidator = [
  body("category_name")
    .optional()
    .notEmpty()
    .withMessage("Category name cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Category name must not exceed 100 characters"),

  body("description")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Description must not exceed 255 characters"),

  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either 'active' or 'inactive'"),
];

export const categoryByIdValidator = [
  param("id")
    .isInt({ gt: 0 }).withMessage("Categories id must be a positive integer"),
];
