import { ref } from 'vue';
import { defineStore } from "pinia";
import { getCategoryName } from "../services/category";

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
    return { getCategoryNameStore };
})
