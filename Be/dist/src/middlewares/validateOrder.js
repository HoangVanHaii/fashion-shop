"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateOrder = void 0;
const express_validator_1 = require("express-validator");
// export const validateOrderItem = (product: ProductPayload, item: OrderItem) => {
//     if (!product || product.status !== "active") {
//         throw new AppError(`Product with ID ${item.product_id} not found or inactive`, 404);
//     } 
//     const productColor = product.colors.find(c => c.id == item.color_id);
//     if (!productColor) {
//         throw new AppError(`Color ${item.color_id} does not exist`, 404);
//     }
//     const productSize = productColor.sizes.find(s => s.id == item.size_id);
//     if (!productSize) {
//         throw new AppError(`Size ${item.size_id} does not exist in color ${item.color_id}`, 404 );
//     }
//     if (productSize.stock < item.quantity) {
//         throw new AppError(`Insufficient stock for size ${productSize.id} (available: ${productSize.stock}, requested: ${item.quantity})`, 400);
//     }
//     return productSize;
// };
exports.validateCreateOrder = [
    (0, express_validator_1.body)("orderItems")
        .isArray({ min: 1 })
        .withMessage("Order must have at least 1 item"),
    (0, express_validator_1.body)("orderItems.*.size_id")
        .isInt({ gt: 0 })
        .withMessage("Size ID must be a positive integer"),
    (0, express_validator_1.body)("orderItems.*.quantity")
        .isInt({ gt: 0 })
        .withMessage("Quantity must be a positive integer"),
    (0, express_validator_1.body)("voucherCode")
        .optional()
        .isString()
        .isLength({ max: 50 })
        .withMessage("Voucher code must be a string with max length 50"),
    (0, express_validator_1.body)("shippingName")
        .isString()
        .notEmpty()
        .withMessage("Shipping name is required"),
    (0, express_validator_1.body)("shippingAddress")
        .isString()
        .notEmpty()
        .withMessage("Shipping address is required"),
    (0, express_validator_1.body)("shippingPhone")
        .isMobilePhone("vi-VN")
        .withMessage("Invalid shipping phone number"),
    (0, express_validator_1.body)("methodPayment")
        .isIn(["cod", "banking", "momo", "vnpay"])
        .withMessage("Payment method must be one of: cod, banking, momo, vnpay"),
];
