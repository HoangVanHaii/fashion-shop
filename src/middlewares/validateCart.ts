import { body } from "express-validator";

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
    positiveIntValidator('quantity')
]
export const updateCartItemValidator = [
    positiveIntValidator('color_id'),
    positiveIntValidator('size_id')
]
