import { connectionDB } from "../config/database";
import { Review, ReviewOfProduct } from "../interfaces/review";
import { AppError } from "../utils/appError";

export const createReview = async (review: Review): Promise<void> => {
    const pool = await connectionDB();
    const transaction = await pool.transaction();
    try {
        await transaction.begin();
        const insertReviewResult = await transaction
            .request()
            .input("product_id", review.product_id)
            .input("user_id", review.user_id)
            .input("rating", review.rating)
            .input("comment", review.comment)
            .query(`INSERT INTO reviews (product_id, user_id, rating, comment)
                    OUTPUT INSERTED.id
                    VALUES (@product_id, @user_id, @rating, @comment)`);
        
        const reviewId = insertReviewResult.recordset[0].id;

        for (const image of review.review_images) {
            await transaction
                .request()
                .input("review_id", reviewId)
                .input("image_url", image.image_url)
                .query(`INSERT INTO review_images (review_id, image_url)
                        VALUES (@review_id, @image_url)`);
        }

        await transaction.commit();
    } catch (err) {
        await transaction.rollback();
        console.error(err);
        throw new AppError("Failed to create review", 500, false);
    } 
}
export const getReviewsByProductId = async (product_id: number): Promise<ReviewOfProduct> => {
    try {
        const pool = await connectionDB();
        const result = await pool
            .request()
            .input("product_id", product_id)
            .query(`SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at,
                           ri.id AS review_image_id, ri.image_url
                    FROM reviews r
                    LEFT JOIN review_images ri ON r.id = ri.review_id
                    WHERE r.product_id = @product_id`);
        const reviewsMap: { [key: number]: Review } = {};
        const total_reviews = result.recordset.length;
        const average_rating = result.recordset.reduce((acc, row) => acc + row.rating, 0) / total_reviews;
        result.recordset.forEach(row => {
            if (!reviewsMap[row.id]) {
                reviewsMap[row.id] = {
                    id: row.id,
                    product_id: row.product_id,
                    user_id: row.user_id,
                    rating: row.rating,
                    comment: row.comment,
                    created_at: row.created_at,
                    review_images: []
                };
            }
            if (row.review_image_id) {
                reviewsMap[row.id].review_images.push({
                    id: row.review_image_id,
                    image_url: row.image_url
                });
            }
        });
        const reviewOfProduct: ReviewOfProduct = { total_reviews, average_rating, Reviews: Object.values(reviewsMap) };
        
        return reviewOfProduct;
        
    } catch (err) {
        console.error(err);
        throw new AppError("Failed to get reviews", 500, false);
    }
}
export const removeReviewById = async (review_id: number): Promise<void> => {
    try {
        const pool = await connectionDB();
        await pool
            .request()
            .input("review_id", review_id)
            .query(`DELETE FROM review_images WHERE review_id = @review_id;
                    DELETE FROM reviews WHERE id = @review_id`);
        
    } catch (err) {
        console.error(err);
        throw new AppError("Failed to delete review", 500, false);
    }
}
export const getReviewById = async (review_id: number): Promise<Review | null> => {
    try {
        const pool = await connectionDB();
        const result = await pool
            .request()
            .input("review_id", review_id)
            .query(`SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at,
                           ri.id AS review_image_id, ri.image_url
                    FROM reviews r
                    LEFT JOIN review_images ri ON r.id = ri.review_id
                    WHERE r.id = @review_id`);
        
        if (result.recordset.length === 0) {
            return null;
        }

        const review: Review = {
            id: result.recordset[0].id,
            product_id: result.recordset[0].product_id,
            user_id: result.recordset[0].user_id,
            rating: result.recordset[0].rating,
            comment: result.recordset[0].comment,
            created_at: result.recordset[0].created_at,
            review_images: []
        };

        result.recordset.forEach(row => {
            if (row.review_image_id) {
                review.review_images.push({
                    id: row.review_image_id,
                    image_url: row.image_url
                });
            }
        });

        return review;

    } catch (err) {
        console.error(err);
        throw new AppError("Failed to get review", 500, false);
    }
}