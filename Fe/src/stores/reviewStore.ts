import { defineStore } from "pinia";
import { getReviewsByProductId,createReview,getReviewsByOrderItemIdOfMe } from "../services/review";
import type { CreateReviewPayload, Review, ReviewOfProduct } from "../interfaces/review";
export const useReviewStore = defineStore('review', () => {
    const getReviewsByProductIdStore = async (product_id: number) => {
        try {
            const res = await getReviewsByProductId(product_id);
            return res.data as ReviewOfProduct;
        } catch (error) {
            // console.error("Failed to fetch cart count:", error);
            // return 0;
        }
    }

    const createReviewStore = async (create_review: CreateReviewPayload) => {
        try {
            const res = await createReview(create_review)
            return res.data;
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    const getReviewsByOrderItemIdOfMeStore = async (order_item_id: number) => {
    try {
      const res = await getReviewsByOrderItemIdOfMe(order_item_id);
      return res.data;
    } catch (error) {
      console.error("Failed to fetch my review by order_item_id:", error);
      throw error;
    }
  };
    return { getReviewsByProductIdStore,createReviewStore,getReviewsByOrderItemIdOfMeStore };
})
