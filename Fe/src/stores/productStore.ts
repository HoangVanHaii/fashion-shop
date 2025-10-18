import { defineStore } from "pinia";
import { searchByCategoryGender } from '../services/product'
import type { ProductSummary } from "../interfaces/product";
export const useProductStore = defineStore('product', () => {
    const searchByCategoryGenderStore = async (gender: string) => {{
        try {
            const res = await searchByCategoryGender(gender);
            console.log(res);
            return res as ProductSummary[];
        } catch (error) {
            console.error("Failed to fetch product:", error);
            // // return 0;
            // const s: ProductSummary[] = []
            return []
        }
    }}
    return { searchByCategoryGenderStore };
})
