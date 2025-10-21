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
            .input("order_item_id", review.order_item_id)
            .input("user_id", review.user_id)
            .input("rating", review.rating)
            .input("comment", review.comment)
            .query(`INSERT INTO reviews (order_item_id, user_id, rating, comment, created_at)
                    OUTPUT INSERTED.id
                    VALUES (@order_item_id, @user_id, @rating, @comment, GETDATE())`);
        
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
            .query(`
                SELECT r.id AS review_id,
                       r.order_item_id,
                       r.user_id,
                       r.rating,
                       r.comment,
                       r.created_at,
                       ri.id AS review_image_id,
                       ri.image_url,
                       u.name AS user_name,
                       u.avatar AS user_image_url
                FROM reviews r
                INNER JOIN order_items oi ON r.order_item_id = oi.id
                INNER JOIN product_sizes ps ON oi.size_id = ps.id
                INNER JOIN product_colors pc ON ps.color_id = pc.id
                INNER JOIN users u ON r.user_id = u.id
                LEFT JOIN review_images ri ON r.id = ri.review_id
                WHERE pc.product_id = @product_id
                
            `);
        const reviewsMap: { [key: number]: Review } = {};
        const total_reviews = result.recordset.length;
        const average_rating = result.recordset.reduce((acc, row) => acc + row.rating, 0) / total_reviews;
        result.recordset.forEach(row => {
            if (!reviewsMap[row.review_id]) {
                reviewsMap[row.review_id] = {
                    id: row.review_id,
                    order_item_id: row.order_item_id,
                    user_id: row.user_id,
                    user_name: row.user_name,
                    user_image_url: row.user_image_url,
                    rating: row.rating,
                    comment: row.comment,
                    created_at: row.created_at,
                    review_images: []
                };
            }
            if (row.review_image_id) {
                reviewsMap[row.review_id].review_images.push({
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
export const removeReviewById = async (review_id: number, user_id: number): Promise<void> => {
    try {
        const pool = await connectionDB();
        const result = await pool
            .request()
            .input("review_id", review_id)
            .input("user_id", user_id)
            .query(`
                DELETE FROM review_images 
                WHERE review_id IN (
                    SELECT id FROM reviews WHERE id = @review_id AND user_id = @user_id
                );

                DELETE FROM reviews
                WHERE id = @review_id AND user_id = @user_id;
            `);

        if (result.rowsAffected[1] === 0) {
            throw new AppError("You are not allowed to delete this review", 403, true);
        }

    } catch (err) {
        console.error(err);
        if (err instanceof AppError) throw err;
        throw new AppError("Failed to delete review", 500, false);
    }
}

export const getReviewById = async (review_id: number): Promise<Review | null> => {
    try {
        const pool = await connectionDB();
        const result = await pool
            .request()
            .input("review_id", review_id)
            .query(`SELECT r.id, r.order_item_id, r.user_id, r.rating, r.comment, r.created_at,
                           ri.id AS review_image_id, ri.image_url
                    FROM reviews r
                    LEFT JOIN review_images ri ON r.id = ri.review_id
                    WHERE r.id = @review_id`);
        
        if (result.recordset.length === 0) {
            return null;
        }

        const review: Review = {
            id: result.recordset[0].id,
            order_item_id: result.recordset[0].order_item_id,
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

export const updateReview = async (review: Review): Promise<void> => {
    const pool = await connectionDB();
    const transaction = await pool.transaction();
    try {
        await transaction.begin();

        const updateResult = await transaction
            .request()
            .input("review_id", review.id)
            .input("user_id", review.user_id)
            .input("rating", review.rating)
            .input("comment", review.comment)
            .input("created_at", review.created_at)
            .query(`
                UPDATE reviews
                SET 
                    rating = @rating,
                    comment = @comment,
                    created_at = @created_at
                WHERE id = @review_id AND user_id = @user_id
            `);

        if (updateResult.rowsAffected[0] === 0) {
            
            throw new AppError("You are not allowed to update this review", 403);
        }

        if (review.review_images && review.review_images.length > 0) {
            await transaction
                .request()
                .input("review_id", review.id)
                .query(`DELETE FROM review_images WHERE review_id = @review_id`);

            for (const image of review.review_images) {
                await transaction
                    .request()
                    .input("review_id", review.id)
                    .input("image_url", image.image_url)
                    .query(`INSERT INTO review_images (review_id, image_url)
                            VALUES (@review_id, @image_url)`);
            }
        }

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        throw new AppError("Failed to update review", 500, false);
    }
};
