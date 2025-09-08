import { Request, Response } from "express";
import { body } from "express-validator";

const validateShopId = body('shop_id').isInt({ gt :0 })
    .withMessage('shop_id must be a positive integer')
    .notEmpty().withMessage("shop_id is required")
    .bail()

const validateCategoryId = body('category_id').isInt({ gt :0 })
    .withMessage('category_id must be a positive integer')
    .notEmpty().withMessage("category_id is required")
    .bail()

const validateName = body('name').isString().withMessage('nmae must be a string')
    .notEmpty().withMessage('name is required')
    .bail()

const validateDescription = body('decription')
    .optional().isString().withMessage('description must be a string')
    .bail()

const validatePrice = body('price')
    .isFloat({ gt: 0 }).withMessage('price must be a number greater than 0')
    .notEmpty().withMessage('price is required')
    .bail()

const validateStock = body('stock')
    .isInt({ min: 0 }).withMessage('stock must be an integer equal or greater than 0')
    .notEmpty().withMessage('stock is required')
    .bail()
export const AddProduct = [validateShopId, validateCategoryId, validateName, validateDescription, validatePrice, validateStock];

const makeOptionalValidator = (validator: any) => {
    return validator.optional({nullable: true})
}
const atLeastOneField = body().custom((_, { req }) => {
    const allowedFields = ['shop_id', 'category_id', 'name', 'description', 'price', 'stock', 'status'];
    const hasAtleastOne = Object.keys(req.body).filter(key => allowedFields.includes(key));
    if( hasAtleastOne.length === 0 ) {
        throw new Error('At least one field to update must be provided');
    }
    return true;
})
export const updateProduct = [
    makeOptionalValidator(validateShopId),
    makeOptionalValidator(validateCategoryId),
    makeOptionalValidator(validateName),
    makeOptionalValidator(validateDescription),
    makeOptionalValidator(validatePrice),
    makeOptionalValidator(validateStock),
    body('status')
        .optional()
        .isIn(['active', 'hidden', 'banned']).withMessage("Status must be either 'active', 'hidden' or 'banned'")
        .bail(),
    atLeastOneField
]

export const softDeleteProduct = async(req: Request, res: Response, next: any) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: "Product ID is required" });
    }
    next();
}