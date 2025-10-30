"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVoucherData = exports.createVoucherData = void 0;
const express_validator_1 = require("express-validator");
const voucherData = [
    (0, express_validator_1.body)('code').notEmpty().withMessage('Code is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('discount_type').isIn(['PERCENT', 'FIXED']).withMessage('Discount type must be either PERCENT or FIXED'),
    (0, express_validator_1.body)('discount_value').isFloat({ gt: 0 }).withMessage('Discount value must be a positive number'),
    (0, express_validator_1.body)('min_order_value').isFloat({ gt: 0 }).withMessage('Minimum order value must be a positive number'),
    (0, express_validator_1.body)('max_discount').isFloat({ gt: 0 }).withMessage('Maximum discount must be a positive number'),
    (0, express_validator_1.body)('start_date').isISO8601().toDate().withMessage('Start date must be a valid date'),
    (0, express_validator_1.body)('end_date').isISO8601().toDate().withMessage('End date must be a valid date'),
    (0, express_validator_1.body)('usage_limit').isInt({ gt: 0 }).withMessage('Usage limit must be a positive integer'),
    (0, express_validator_1.body)('scope').isIn(['GLOBAL', 'SHOP']).withMessage('Scope must be either GLOBAL or SHOP')
];
const validateScope = (0, express_validator_1.body)('scope').custom((value, { req }) => {
    if (value === 'SHOP' && (req.user.role !== 'seller' && req.user.role !== 'admin')) {
        throw new Error("Only sellers or admins can create SHOP scoped vouchers");
    }
    else if (value === 'GLOBAL' && req.user.role !== 'admin') {
        throw new Error("Only admins can create GLOBAL scoped vouchers");
    }
    return true;
});
exports.createVoucherData = [...voucherData, validateScope];
const makeOptionalValidator = (validator) => validator.optional({ nullable: true });
exports.updateVoucherData = [
    ...voucherData.map(makeOptionalValidator),
    validateScope.optional({ nullable: true })
];
