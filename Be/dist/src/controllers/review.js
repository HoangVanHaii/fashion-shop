"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReview = exports.getReviewById = exports.removeReviewById = exports.getReviewsByProductId = exports.createReview = void 0;
const reviewService = __importStar(require("../services/review"));
const appError_1 = require("../utils/appError");
const createReview = async (req, res, next) => {
    try {
        const { order_item_id, rating, comment } = req.body;
        const user_id = req.user.id;
        const reviewImages = req.files || [];
        const pathImages = reviewImages.map(file => ({ image_url: `/uploads/reviews/${file.filename}` }));
        const review = { order_item_id, user_id, rating, comment, review_images: pathImages };
        await reviewService.createReview(review);
        res.status(201).json({
            success: true,
            message: 'Review created successfully'
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createReview = createReview;
const getReviewsByProductId = async (req, res, next) => {
    try {
        const product_id = parseInt(req.params.product_id);
        const reviews = await reviewService.getReviewsByProductId(product_id);
        res.status(200).json({
            success: true,
            message: "Reviews fetched successfully",
            data: reviews
        });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
};
exports.getReviewsByProductId = getReviewsByProductId;
const removeReviewById = async (req, res, next) => {
    try {
        const review_id = parseInt(req.params.review_id);
        const user_id = req.user.id;
        await reviewService.removeReviewById(review_id, user_id);
        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.removeReviewById = removeReviewById;
const getReviewById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.review_id);
        const review = await reviewService.getReviewById(id);
        if (!review) {
            throw new appError_1.AppError("Review not found", 404);
        }
        return res.status(200).json({
            success: true,
            message: "Review fetched successfully",
            data: review
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getReviewById = getReviewById;
const updateReview = async (req, res, next) => {
    try {
        const review_id = parseInt(req.params.review_id);
        const user_id = req.user.id;
        const existingReview = await reviewService.getReviewById(review_id);
        if (!existingReview) {
            throw new appError_1.AppError("Review not found", 404);
        }
        //Lấy ảnh mới
        const reviewImages = req.files || [];
        const pathImages = reviewImages.map(file => ({ image_url: `/uploads/reviews/${file.filename}` }));
        const review = {
            id: existingReview.id,
            order_item_id: existingReview.order_item_id,
            user_id: req.user.id,
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
    }
    catch (error) {
        console.log(error);
        next(error);
    }
};
exports.updateReview = updateReview;
