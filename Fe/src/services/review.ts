import type { CreateReviewPayload } from "../interfaces/review";
import api from "./api";

export const getReviewsByProductId = async (product_id: number) => {
    const response = await api.get(`/review/product/${product_id}`);
    return response.data;
};
export const getReviewsByOrderItemIdOfMe = async (order_item_id: number) =>{
  const response = await api.get(`/review/review_of_me/${order_item_id}`);
  return response.data;
}

export const createReview = async (create_review: CreateReviewPayload) => {
  const formData = new FormData();
  formData.append("order_item_id", String(create_review.order_item_id));
  formData.append("rating", String(create_review.rating));
  formData.append("comment", create_review.comment);

  if (create_review.review_images && create_review.review_images.length > 0) {
    create_review.review_images.forEach((file) => formData.append("review_images", file));
  }
  
  const res = await api.post("/review", formData);

  return res.data;
};