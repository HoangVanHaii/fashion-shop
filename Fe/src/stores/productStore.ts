import { defineStore } from "pinia";
import { getProductByCategory, searchByCategoryGender, getProductById } from '../services/product'
import type { ProductSummary, ProductPayload } from "../interfaces/product";
export const useProductStore = defineStore('product', () => {
    const searchByCategoryGenderStore = async (gender: string) => {
        try {
            const res = await searchByCategoryGender(gender);
            console.log(res);
            return res as ProductSummary[];
        } catch (error) {
            console.error("Failed to fetch product:", error);
            return []
        }
    }
    const searchByCategoryStore = async (categoryName: string) => {
        try {
            const res = await getProductByCategory(categoryName);
            return res as ProductSummary[];
        } catch (error) {
            console.error("Failed to fetch product:", error);
            return []
        }
    }
    const getProductByIdStore = async (id: number) => {
        try {
            const res = await getProductById(id);
            return res as ProductPayload;
        } catch (error) {
            console.log("Failed to fetch product",error);
        }
    }

    return { searchByCategoryStore, searchByCategoryGenderStore, getProductByIdStore};
})
