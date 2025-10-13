import { body, param } from "express-validator";

export const validateCreateFlashSale = [
    body('title')
        .isString().withMessage('Title must be a string')
        .notEmpty().withMessage('Title is required')
        .bail(),
    body('startDate')
        .notEmpty().withMessage('Start date is required')
        .isISO8601().withMessage('Start date must be a valid date')
        .toDate()
        .bail(),
    body('endDate')
        .notEmpty().withMessage('End date is required')
        .isISO8601().withMessage('End date must be a valid date')
        .toDate()
        .bail()
]

export const validateAddFlashSaleItem = [
    body('items')
        .isArray({ min: 1 }).withMessage('Items must be a non-empty array')
        .bail(),
    body('items.*.product_id')
        .notEmpty().withMessage((value, { path }) => `${path} is required`)
        .isInt({ gt: 0 }).withMessage((value, { path }) => `${path} must be a positive integer`)
        .bail(),
    body('items.*.flash_sale_price')
        .notEmpty().withMessage((value, { path }) => `${path} is required`)
        .isFloat({ gt: 0 }).withMessage((value, { path }) => `${path} must be a positive number`)
        .bail(),
    body('items.*.stock')
        .notEmpty().withMessage((value, { path }) => `${path} is required`)
        .isInt({ gt: -1 }).withMessage((value, { path }) => `${path} must be a non-negative integer`)
        .bail()
];
export const validateUpdateFlashSaleItem = [
    param("id")
        .isInt({gt: 0}).withMessage("Flash sale item id mus be a positive number"),
    body('flash_sale_price')
        .optional()
        .isFloat({ gt: 0 }).withMessage('Flash sale price must be a positive number')
        .bail(),
    body('stock')
        .optional()
        .isInt({ gt: -1 }).withMessage('Stock must be a non-negative integer')
        .bail()
]
export const validateUpdateFlashSale = [
    body('title')
        .optional()
        .isString().withMessage('Title must be a string')
        .notEmpty().withMessage('Title cannot be empty')
        .bail(),
    body('startDate')
        .optional()
        .isISO8601().withMessage('Start date must be a valid date')
        .toDate()
        .bail(),
    body('endDate')
        .optional()
        .isISO8601().withMessage('End date must be a valid date')
        .toDate()
        .bail(),
    body('status')
        .optional()
        .isIn(['pending', 'active', 'ended', 'cancelled']).withMessage('Status must be either active or cancelled')
        .bail(),
]
export const validateId = [
    param("id")
        .isInt({ gt: 0 }).withMessage("Flash sale item id mus be a positive number")
]
