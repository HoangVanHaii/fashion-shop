"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateId = exports.validateUpdateFlashSale = exports.validateUpdateFlashSaleItem = exports.validateAddFlashSaleItem = exports.validateCreateFlashSale = void 0;
const express_validator_1 = require("express-validator");
exports.validateCreateFlashSale = [
    (0, express_validator_1.body)('title')
        .isString().withMessage('Title must be a string')
        .notEmpty().withMessage('Title is required')
        .bail(),
    (0, express_validator_1.body)('startDate')
        .notEmpty().withMessage('Start date is required')
        .isISO8601().withMessage('Start date must be a valid date')
        .toDate()
        .bail(),
    (0, express_validator_1.body)('endDate')
        .notEmpty().withMessage('End date is required')
        .isISO8601().withMessage('End date must be a valid date')
        .toDate()
        .bail()
];
exports.validateAddFlashSaleItem = [
    (0, express_validator_1.body)('items')
        .isArray({ min: 1 }).withMessage('Items must be a non-empty array')
        .bail(),
    (0, express_validator_1.body)('items.*.product_id')
        .notEmpty().withMessage((value, { path }) => `${path} is required`)
        .isInt({ gt: 0 }).withMessage((value, { path }) => `${path} must be a positive integer`)
        .bail(),
    (0, express_validator_1.body)('items.*.flash_sale_price')
        .notEmpty().withMessage((value, { path }) => `${path} is required`)
        .isFloat({ gt: 0 }).withMessage((value, { path }) => `${path} must be a positive number`)
        .bail(),
    (0, express_validator_1.body)('items.*.stock')
        .notEmpty().withMessage((value, { path }) => `${path} is required`)
        .isInt({ gt: -1 }).withMessage((value, { path }) => `${path} must be a non-negative integer`)
        .bail()
];
exports.validateUpdateFlashSaleItem = [
    (0, express_validator_1.param)("id")
        .isInt({ gt: 0 }).withMessage("Flash sale item id mus be a positive number"),
    (0, express_validator_1.body)('flash_sale_price')
        .optional()
        .isFloat({ gt: 0 }).withMessage('Flash sale price must be a positive number')
        .bail(),
    (0, express_validator_1.body)('stock')
        .optional()
        .isInt({ gt: -1 }).withMessage('Stock must be a non-negative integer')
        .bail()
];
exports.validateUpdateFlashSale = [
    (0, express_validator_1.body)('title')
        .optional()
        .isString().withMessage('Title must be a string')
        .notEmpty().withMessage('Title cannot be empty')
        .bail(),
    (0, express_validator_1.body)('startDate')
        .optional()
        .isISO8601().withMessage('Start date must be a valid date')
        .toDate()
        .bail(),
    (0, express_validator_1.body)('endDate')
        .optional()
        .isISO8601().withMessage('End date must be a valid date')
        .toDate()
        .bail(),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['pending', 'active', 'ended', 'cancelled']).withMessage('Status must be either active or cancelled')
        .bail(),
];
exports.validateId = [
    (0, express_validator_1.param)("id")
        .isInt({ gt: 0 }).withMessage("Flash sale item id mus be a positive number")
];
