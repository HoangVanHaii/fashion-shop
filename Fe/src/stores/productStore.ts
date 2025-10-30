import { defineStore } from "pinia";
import { getProductIdBySize,getProductByCategory, searchByCategoryGender, getProductByName, getProductById, getProductBestSeller, getProductLatest, getProductByShop, getAllProductActive } from '../services/product'
import { ref } from "vue";
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
    const getProductIdBySizeStore = async(size_id:number)=>{
         try {
            const res = await getProductIdBySize(size_id);
            return res.data;
        } catch (error) {
            console.log("Failed to get productId",error);
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
    const getProductBestSellerStore = async () => {
        try {
            const result = await getProductBestSeller(20);
            return result as ProductSummary[];
        } catch (err) {
            console.log(err);
            return [];
        }
    }
    const getProductLatestStore = async () => {
        try {
            const result = await getProductLatest(20);
            return result as ProductSummary[];
        } catch (err) {
            console.log(err);
            return [];
        }
    }
    const getProductByNameStore = async (name: string) => {
        try {
            const result = await getProductByName(name);
            return result as ProductSummary[];
        } catch (err) {
            console.log(err);
            return [];
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
    const getAllProductActiveStore = async () => {
        try {
            const result = await getAllProductActive();
            return result;
        } catch (err) {
            console.log(err);
        }
    }


    return { searchByCategoryStore, getAllProductActiveStore, searchByCategoryGenderStore, getProductByIdStore, getProductBestSellerStore, getProductLatestStore, getProductByNameStore, getProductByShopStore, loading};
})
