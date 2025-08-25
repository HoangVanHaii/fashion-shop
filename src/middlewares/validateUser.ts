import { body } from "express-validator"

export const registerValidator = [
    body("name")
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 3, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format"),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 3 }).withMessage("Password must be at least 3 characters"),
    body("role")
        .optional()
        .isIn(["customer", "seller", "admin"]).withMessage("Role must be either 'customer', 'seller' or 'admin")
]

export const loginValidator = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format"),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({min: 3}).withMessage("Password must be at least 3 characters")
]

export const refreshTokenValidator = [
    body("refreshToken").notEmpty().withMessage("refreshToken is required")
]