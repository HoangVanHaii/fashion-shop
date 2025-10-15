import { body } from "express-validator";
import { param } from "express-validator";

export const createReviewValidator = [
    body("order_item_id")
        .isInt({ gt: 0 })
        .withMessage("Order_Item ID must be a positive integer"),
    body("rating")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be an integer between 1 and 5"),
    body("comment")
        .isString()
        .isLength({ min: 10, max: 250 })
        .withMessage("Comment must be between 10 and 250 characters"),
    body("review_images").custom((_, { req }) => {
    const files = req.files as Express.Multer.File[] | [];
    
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
export const review_idValidator = [
    param("review_id")
        .isInt({ gt: 0 })
        .withMessage("Review ID must be a positive integer")
]
export const product_idValidator = [
    param("product_id")
        .isInt({ gt: 0 })
        .withMessage("Product ID must be a positive integer")
]

export const updateReviewValidator = [
    body("rating")
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be an integer between 1 and 5"),
    body("comment")
        .optional()
        .isString()
        .isLength({ min: 10, max: 250 })
        .withMessage("Comment must be between 10 and 250 characters"),
    body("review_images").custom((_, { req }) => {
        const files = req.files as Express.Multer.File[] | [];

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