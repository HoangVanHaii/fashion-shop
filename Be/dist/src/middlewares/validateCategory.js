"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryByIdValidator = exports.updateCategoryValidator = exports.addCategoryValidator = void 0;
// validators/categoryValidator.ts
const express_validator_1 = require("express-validator");
exports.addCategoryValidator = [
    (0, express_validator_1.body)("category_name")
        .notEmpty()
        .withMessage("Category name is required")
        .isLength({ max: 100 })
        .withMessage("Category name must not exceed 100 characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .isLength({ max: 255 })
        .withMessage("Description must not exceed 255 characters"),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn(["active", "inactive"])
        .withMessage("Status must be either 'active' or 'inactive'"),
    (0, express_validator_1.body)("gender")
        .optional()
        .isIn(["Nam", "Nữ"]).withMessage("Gender is in Nam or Nu")
];
exports.updateCategoryValidator = [
    (0, express_validator_1.body)("category_name")
        .optional()
        .notEmpty()
        .withMessage("Category name cannot be empty")
        .isLength({ max: 100 })
        .withMessage("Category name must not exceed 100 characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .isLength({ max: 255 })
        .withMessage("Description must not exceed 255 characters"),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn(["active", "inactive"])
        .withMessage("Status must be either 'active' or 'inactive'"),
];
exports.categoryByIdValidator = [
    (0, express_validator_1.param)("id")
        .isInt({ gt: 0 }).withMessage("Categories id must be a positive integer"),
];
