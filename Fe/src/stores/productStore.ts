import { defineStore } from "pinia";
import { ref } from "vue";
import { getProductByCategory, searchByCategoryGender, getProductById, getProductByShop } from '../services/product'
import type { ProductSummary, ProductPayload } from "../interfaces/product";
export const useProductStore = defineStore('product', () => {
    const loading = ref<boolean>(true);
    const searchByCategoryGenderStore = async (gender: string) => {
        loading.value = true;
        try {
            const res = await searchByCategoryGender(gender);
            return res as ProductSummary[];
        } catch (error) {
            console.error("Failed to fetch product:", error);
            return []
        } finally {
            loading.value = false;
        }
    }
    const searchByCategoryStore = async (categoryName: string) => {
        loading.value = true;
        try {
            const res = await getProductByCategory(categoryName);
            return res as ProductSummary[];
        } catch (error) {
            console.error("Failed to fetch product:", error);
            return []
        } finally {
            loading.value = false;
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
    const getProductByShopStore = async (id: number) => {
        try {
            const result = await getProductByShop(id);
            return result
        } catch (err) {
            console.log(err);
        }
    }

    return { searchByCategoryStore, searchByCategoryGenderStore, getProductByIdStore, getProductByShop, getProductByShopStore, loading };
})
