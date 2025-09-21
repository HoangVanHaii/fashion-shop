export interface Review {
    id?: number;
    product_id: number;
    user_id: number;
    rating: number;
    comment: string;
    review_images: ReviewImage[];
    created_at?: Date;
}
export interface ReviewImage {
    id?: number;
    image_url: string;
}

export interface ReviewOfProduct{
    total_reviews: number;
    average_rating: number;
    Reviews: Review[];
}