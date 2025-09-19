import { body, param } from "express-validator";

const positiveIntValidator = (fieldName: string) => {
    return body(fieldName)
        .notEmpty().withMessage(`${fieldName} is required`)
        .isInt({ gt: 0 }).withMessage(`${fieldName} must be a positive integer`)
}

export const addToCartValidator = [
    positiveIntValidator('product_id'),
    positiveIntValidator('color_id'),
    positiveIntValidator('size_id'),
    positiveIntValidator('quantity')
]
export const updateCartItemQuantityValidator = [
    param('id').isInt({ gt: 0 }).withMessage('Cart item id must be a positive integer'),
    positiveIntValidator('quantity')
]
export const updateCartItemValidator = [
    param('id').isInt({ gt: 0 }).withMessage('Cart item id must be a positive integer'),
    positiveIntValidator('color_id'),
    positiveIntValidator('size_id')
]
export const removeCartItemValidator = [
    param('id').isInt({ gt: 0 }).withMessage('Cart item id must be a positive integer')
]
