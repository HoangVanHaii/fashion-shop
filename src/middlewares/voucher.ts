import { body } from "express-validator";
import { Request } from "express";

const voucherData = [
    body('code').notEmpty().withMessage('Code is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('discount_type').isIn(['PERCENT', 'FIXED']).withMessage('Discount type must be either PERCENT or FIXED'),
    body('discount_value').isFloat({ gt: 0 }).withMessage('Discount value must be a positive number'),
    body('min_order_value').isFloat({ gt: 0 }).withMessage('Minimum order value must be a positive number'),
    body('max_discount').isFloat({ gt: 0 }).withMessage('Maximum discount must be a positive number'),
    body('start_date').isISO8601().toDate().withMessage('Start date must be a valid date'),
    body('end_date').isISO8601().toDate().withMessage('End date must be a valid date'),
    body('usage_limit').isInt({ gt: 0 }).withMessage('Usage limit must be a positive integer'),
    body('scope').isIn(['GLOBAL', 'SHOP']).withMessage('Scope must be either GLOBAL or SHOP')
];

const validateScope = body('scope').custom((value, { req }) => {
    if (value === 'SHOP' && (req.user!.role !== 'seller' && req.user!.role !== 'admin')) {
        throw new Error("Only sellers or admins can create SHOP scoped vouchers");
    } else if (value === 'GLOBAL' && req.user!.role !== 'admin') {
        throw new Error("Only admins can create GLOBAL scoped vouchers");
    }
    return true;
});

export const createVoucherData = [...voucherData, validateScope];

const makeOptionalValidator = (validator: any) => validator.optional({ nullable: true });

export const updateVoucherData = [
    ...voucherData.map(makeOptionalValidator),
    validateScope.optional({ nullable: true })
];
