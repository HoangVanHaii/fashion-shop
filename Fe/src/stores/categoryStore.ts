import { ref } from 'vue';
import { defineStore } from "pinia";
import { getActiveCategory, getCategoryName } from "../services/category";

export const useCategoryStore = defineStore('category', () => {
    const loading = ref<boolean>(true);
    const getCategoryNameStore = async (gender: string) => {
        loading.value = true;
        try {
            const res = await getCategoryName(gender);
            return res.data;
        } catch (error) {
            // console.error("Failed to fetch cart count:", error);
            // return 0;
        } finally {
            loading.value = false;
        }
    }
    const getActiveCategoryStore = async () => {
        loading.value = true;
        try {
            const res = await getActiveCategory();
            return res.data;
        } catch (error) {
            // console.error("Failed to fetch cart count:", error);
            // return 0;
        } finally {
            loading.value = false;
        }
    }
    return { getCategoryNameStore, getActiveCategoryStore };
})
