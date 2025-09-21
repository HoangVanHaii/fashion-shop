import * as reviewService from '../services/review';
import { Request, Response, NextFunction } from 'express'; 
import { Review, ReviewImage } from '../interfaces/review';
import { AppError } from '../utils/appError';

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { product_id, rating, comment } = req.body;
        const user_id = req.user!.id;
        const reviewImages = (req.files as Express.Multer.File[]) || [];
        const pathImages: ReviewImage[] = reviewImages.map(file =>({ image_url: `/uploads/reviews/${file.filename}`}));
        const review: Review = { product_id, user_id, rating, comment, review_images: pathImages };
        await reviewService.createReview(review);
        res.status(201).json({
            success: true,
            message: 'Review created successfully'
        });
    } catch (err) {
        next(err);
    }
}
export const getReviewsByProductId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product_id = parseInt(req.params.product_id);
        const reviews = await reviewService.getReviewsByProductId(product_id);
        res.status(200).json({
            success: true,
            message: "Reviews fetched successfully",
            data: reviews
        });
    } catch (err) {
        next(err);
    }
}
export const removeReviewById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const review_id = parseInt(req.params.review_id);
        await reviewService.removeReviewById(review_id);
        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (err) {
        next(err);
    }
}
export const getReviewById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.review_id;
        const review = await reviewService.getReviewById(parseInt(id));
        if (!review) {
            throw new AppError("Review not found", 404);
        }
        return res.status(200).json({
            success: true,
            message: "Review fetched successfully",
            data: review
        })

    } catch (err : any) {
        next(err); 
    }
}

