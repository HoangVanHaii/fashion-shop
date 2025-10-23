import { ref } from "vue";
import { defineStore } from "pinia";
import type { GetOrder } from "../interfaces/order";
import { getOrderOfMe } from "../services/order";

export const useOrderStore = defineStore("order", () => {
    const loading = ref<boolean>(true);
    const getOrderOfMeStore = async () => {
        loading.value = true
        try {
            const data = await getOrderOfMe();
            return data as GetOrder[];
        } catch (err) {
            console.log(err);
        } finally {
            loading.value = false
        }
    }
   
    return { getOrderOfMeStore, loading}
})