import { defineStore } from "pinia";
import { getReviewsByProductId } from "../services/review";
import type { ReviewOfProduct } from "../interfaces/review";
export const useReviewStore = defineStore('review', () => {
    const getReviewsByProductIdStore = async (product_id: number) => {{
        try {
            const res = await getReviewsByProductId(product_id);
            return res.data as ReviewOfProduct;
        } catch (error) {
            // console.error("Failed to fetch cart count:", error);
            // return 0;
        }
    }}
    return { getReviewsByProductIdStore };
})
