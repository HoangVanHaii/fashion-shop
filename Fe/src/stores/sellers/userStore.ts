import { defineStore } from "pinia";
import { getShopTodoSummary, getShopStatistic } from "../../services/sellers/user";
import { ref } from "vue";

export const userStore = defineStore('user', () => {
    const error = ref<string | null>(null);
    const loading = ref<boolean>(true);
    const getShopTodoSummaryStore = async () => {
        error.value = null;
        loading.value = true;
        try {
            const res = await getShopTodoSummary();
            return res.data;
        } catch (err) {
            console.log(err);
        } finally {
            loading.value = false;
        }
    }
    const getShopStatisticStore = async () => {
        error.value = null;
        loading.value = true;
        try {
            const res = await getShopStatistic();
            return res.data;
        } catch (err) {
            console.log(err);
        } finally {
            loading.value = false;
        }
    }
    return {loading, error, getShopTodoSummaryStore, getShopStatisticStore}
    
})