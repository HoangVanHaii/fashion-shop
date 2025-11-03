import { defineStore } from "pinia";
import { ref } from "vue";
import { getReviewsByProductId,createReview,getReviewsByOrderItemIdOfMe } from "../services/review";
import type { CreateReviewPayload, ReviewOfProduct } from "../interfaces/review";

export const useReviewStore = defineStore('review', () => {
  const loading = ref(false);
  const getReviewsByProductIdStore = async (product_id: number) => {
    loading.value = true;
    try {
      const res = await getReviewsByProductId(product_id);
      return res.data as ReviewOfProduct;
    } catch (error) {
      console.error("Failed to fetch reviews by product_id:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createReviewStore = async (create_review: CreateReviewPayload) => {
    loading.value = true;
    try {
      const res = await createReview(create_review);
      return res.data;
    } catch (error) {
      console.error("Failed to create review:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const getReviewsByOrderItemIdOfMeStore = async (order_item_id: number) => {
    loading.value = true;
    try {
      const res = await getReviewsByOrderItemIdOfMe(order_item_id);
      return res.data;
    } catch (error) {
      console.error("Failed to fetch my review by order_item_id:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    getReviewsByProductIdStore,
    createReviewStore,
    getReviewsByOrderItemIdOfMeStore,
  };
});
