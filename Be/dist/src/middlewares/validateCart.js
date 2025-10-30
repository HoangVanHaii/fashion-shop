"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCartItemValidator = exports.updateCartItemValidator = exports.updateCartItemQuantityValidator = exports.addToCartValidator = void 0;
const express_validator_1 = require("express-validator");
const positiveIntValidator = (fieldName) => {
    return (0, express_validator_1.body)(fieldName)
        .notEmpty().withMessage(`${fieldName} is required`)
        .isInt({ gt: 0 }).withMessage(`${fieldName} must be a positive integer`);
};
exports.addToCartValidator = [
    positiveIntValidator('size_id'),
    positiveIntValidator('quantity')
];
exports.updateCartItemQuantityValidator = [
    (0, express_validator_1.param)('id').isInt({ gt: 0 }).withMessage('Cart item id must be a positive integer'),
    positiveIntValidator('quantity')
];
exports.updateCartItemValidator = [
    (0, express_validator_1.param)('id').isInt({ gt: 0 }).withMessage('Cart item id must be a positive integer'),
    positiveIntValidator('size_id')
];
exports.removeCartItemValidator = [
    (0, express_validator_1.param)('id').isInt({ gt: 0 }).withMessage('Cart item id must be a positive integer')
];
