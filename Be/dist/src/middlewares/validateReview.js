"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReviewValidator = exports.product_idValidator = exports.review_idValidator = exports.createReviewValidator = void 0;
const express_validator_1 = require("express-validator");
const express_validator_2 = require("express-validator");
exports.createReviewValidator = [
    (0, express_validator_1.body)("order_item_id")
        .isInt({ gt: 0 })
        .withMessage("Order_Item ID must be a positive integer"),
    (0, express_validator_1.body)("rating")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be an integer between 1 and 5"),
    (0, express_validator_1.body)("comment")
        .isString()
        .isLength({ min: 10, max: 250 })
        .withMessage("Comment must be between 10 and 250 characters"),
    (0, express_validator_1.body)("review_images").custom((_, { req }) => {
        const files = req.files;
        if (files.length > 5) {
            throw new Error("You can upload up to 5 images");
        }
        files.forEach(file => {
            if (!file.mimetype.startsWith("image/")) {
                throw new Error("Only image files are allowed");
            }
        });
        return true;
    })
];
exports.review_idValidator = [
    (0, express_validator_2.param)("review_id")
        .isInt({ gt: 0 })
        .withMessage("Review ID must be a positive integer")
];
exports.product_idValidator = [
    (0, express_validator_2.param)("product_id")
        .isInt({ gt: 0 })
        .withMessage("Product ID must be a positive integer")
];
exports.updateReviewValidator = [
    (0, express_validator_1.body)("rating")
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be an integer between 1 and 5"),
    (0, express_validator_1.body)("comment")
        .optional()
        .isString()
        .isLength({ min: 10, max: 250 })
        .withMessage("Comment must be between 10 and 250 characters"),
    (0, express_validator_1.body)("review_images").custom((_, { req }) => {
        const files = req.files;
        if (files.length > 5) {
            throw new Error("You can upload up to 5 images");
        }
        files.forEach(file => {
            if (!file.mimetype.startsWith("image/")) {
                throw new Error("Only image files are allowed");
            }
        });
        return true;
    })
];
