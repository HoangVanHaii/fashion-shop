"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.softDeleteProduct = exports.updateProduct = exports.AddProduct = exports.validateLimit = exports.validateSearchByCategoryId = exports.validateSearchByShopId = exports.validateSearchByName = exports.validateSearchById = void 0;
const express_validator_1 = require("express-validator");
exports.validateSearchById = [
    (0, express_validator_1.param)('id').isInt({ gt: 0 }).withMessage('product id must be a positive integer')
];
exports.validateSearchByName = [
    (0, express_validator_1.query)("name").notEmpty().withMessage("Name is required").isString().withMessage("Name must be string"),
];
exports.validateSearchByShopId = [
    (0, express_validator_1.query)('shop_id').notEmpty().withMessage("Shop_id is required").isInt({ gt: 0 })
];
exports.validateSearchByCategoryId = [
    (0, express_validator_1.query)("category_id").optional().isInt({ gt: 0 }).withMessage("Category ID must be a positive integer"),
];
exports.validateLimit = [
    (0, express_validator_1.query)("limit").optional().isInt({ gt: 0 }).withMessage("Limit must be a positive integer"),
];
const validateCategoryId = (0, express_validator_1.body)('category_id').isInt({ gt: 0 })
    .withMessage('category_id must be a positive integer')
    .notEmpty().withMessage("category_id is required")
    .bail();
const validateName = (0, express_validator_1.body)('name').isString().withMessage('nmae must be a string')
    .notEmpty().withMessage('name is required')
    .bail();
const validateDescription = (0, express_validator_1.body)('decription')
    .optional().isString().withMessage('description must be a string')
    .bail();
const validateColor = (0, express_validator_1.body)("colors").custom((value, { req }) => {
    let colors;
    try {
        colors = JSON.parse(value);
    }
    catch (error) {
        throw new Error("colors must be valid JSON array");
    }
    if (!Array.isArray(colors) || colors.length === 0) {
        throw new Error("At least one color is required");
    }
    if (!req.files || req.files.length === 0) {
        throw new Error("At least one image is required");
    }
    if (req.files.length !== 4 * colors.length) {
        throw new Error(`Number of images (${req.files.length}) must be equal to number of colors (${colors.length})`);
    }
    colors.forEach((color, index) => {
        if (!color.color || typeof color.color != "string") {
            throw new Error(`Color at ${index} must have a vailid 'color' field`);
        }
        if (!Array.isArray(color.sizes) || color.sizes.length === 0) {
            throw new Error(`Color at index ${index} must include at least one size`);
        }
        color.sizes.forEach((size, sIndex) => {
            if (!size.size) {
                throw new Error(`Size at color[${index}].sizes[${sIndex}] must include 'size'`);
            }
            if (typeof size.stock !== "number" || size.stock < 0) {
                throw new Error(`Size at color[${index}].sizes[${sIndex}] must have valid 'stock'`);
            }
            if (typeof size.price !== "number" || size.price <= 0) {
                throw new Error(`Size at color[${index}].sizes[${sIndex}] must have valid 'price'`);
            }
        });
    });
    return true;
});
const makeOptionalValidator = (validator) => {
    return validator.optional({ nullable: true });
};
const atLeastOneField = (0, express_validator_1.body)().custom((_, { req }) => {
    const allowedFields = ['shop_id', 'category_id', 'name', 'description', 'price', 'stock', 'status'];
    const hasAtleastOne = Object.keys(req.body).filter(key => allowedFields.includes(key));
    if (hasAtleastOne.length === 0) {
        throw new Error('At least one field to update must be provided');
    }
    return true;
});
exports.AddProduct = [validateCategoryId, validateName, validateDescription, validateColor];
exports.updateProduct = [
    makeOptionalValidator(validateCategoryId),
    makeOptionalValidator(validateName),
    makeOptionalValidator(validateDescription),
    // makeOptionalValidator(validatePrice),
    // makeOptionalValidator(validateStock),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['active', 'hidden', 'banned']).withMessage("Status must be either 'active', 'hidden' or 'banned'")
        .bail(),
    atLeastOneField
];
exports.softDeleteProduct = [
    (0, express_validator_1.body)('id').notEmpty().withMessage('id of product is required')
        .isInt({ gt: 0 }).withMessage('id product must be a positive integer')
];
