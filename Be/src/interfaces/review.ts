export interface Review {
    id?: number;
    order_item_id: number;
    user_id: number;
    user_name?: string;
    user_image_url?: string;
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