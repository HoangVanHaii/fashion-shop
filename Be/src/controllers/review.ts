import * as reviewService from '../services/review';
import { Request, Response, NextFunction } from 'express'; 
import { Review, ReviewImage } from '../interfaces/review';
import { AppError } from '../utils/appError';

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { order_item_id, rating, comment } = req.body;
        const user_id = req.user!.id;
        const reviewImages = (req.files as Express.Multer.File[]) || [];
        const pathImages: ReviewImage[] = reviewImages.map(file =>({ image_url: `/uploads/reviews/${file.filename}`}));
        const review: Review = { order_item_id, user_id, rating, comment, review_images: pathImages };
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
        console.log(err);
        next(err);
    }
}
export const removeReviewById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const review_id = parseInt(req.params.review_id);
        const user_id = req.user!.id;
        await reviewService.removeReviewById(review_id,user_id);
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
        const id = parseInt(req.params.review_id);
        const review = await reviewService.getReviewById(id);
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

export const getReviewsByOrderItemIdOfMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order_item_id = parseInt(req.params.order_id);
        const user_id = req.user!.id; 
        if (isNaN(order_item_id)) {
            throw new AppError("Invalid order_id", 400);
        }

        const reviews = await reviewService.getReviewsByOrderItemIdOfMe(order_item_id, user_id);

        return res.status(200).json({
            success: true,
            message: "Your reviews for this order fetched successfully",
            data: reviews
        });

    } catch (err: any) {
        next(err);
    }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction): Promise<void> =>{
    try {
        const review_id = parseInt(req.params.review_id);
        const existingReview = await reviewService.getReviewById(review_id);
        if (!existingReview) {
            throw new AppError("Review not found", 404);
        }
        //Lấy ảnh mới
        const reviewImages = (req.files as Express.Multer.File[]) || [];
        const pathImages: ReviewImage[] = reviewImages.map(file =>({ image_url: `/uploads/reviews/${file.filename}`}));
       
        const review: Review = {
            id:existingReview.id,
            order_item_id: existingReview.order_item_id,
            user_id: req.user!.id,
            rating: req.body.rating ?? existingReview.rating,
            comment: req.body.comment ?? existingReview.comment,
            created_at: existingReview.created_at,
            review_images: pathImages.length > 0 ? pathImages : existingReview.review_images
        };
        await reviewService.updateReview(review);

        res.status(200).json({
            success: true,
            message: "Review updated successfully"
        });
    } catch (error) {
        console.log(error)
        next(error);
    }
}
