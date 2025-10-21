import { defineStore } from "pinia";
import { getCategoryName } from "../services/category";

export const useCategoryStore = defineStore('category', () => {
    const getCategoryNameStore = async (gender: string) => {{
        try {
            const res = await getCategoryName(gender);
            return res.data;
        } catch (error) {
            // console.error("Failed to fetch cart count:", error);
            // return 0;
        }
    }}
    return { getCategoryNameStore };
})
