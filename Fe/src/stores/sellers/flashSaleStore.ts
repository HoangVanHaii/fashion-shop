import { defineStore } from "pinia";
import type { FlashSaleSeller } from "../../interfaces/flashSale";
import { getFlashSaleForSeller , cancelAllFlashSaleItem} from "../../services/sellers/flashSale";
import { ref } from "vue";

export const flashSaleSellerStore = defineStore("flashSaleSeller", () => {
    const flashSaleHome = ref<FlashSaleSeller[]>([]);
    const error = ref<string | null>(null);
    const loading = ref<boolean>(false);
    const isSuccess = ref<boolean>(false);
    const flashSale = ref<FlashSaleSeller[]>([]);
    const displayFlashSale = ref<FlashSaleSeller[]>([]);

    const getFlashSaleSellerHome = async (status: string) => {
        flashSaleHome.value = [];
        error.value = null;
        loading.value = true;
        isSuccess.value = false;
        try {
            const res = await getFlashSaleForSeller(status);
            flashSaleHome.value = res.data;
            isSuccess.value = true;
        } catch (err) {
            isSuccess.value = false;
            console.log(err);
        } finally {
            loading.value = false;
        }
    }
    const filterFlashSale = (status: string, searchTime: string) => {
        displayFlashSale.value = [];
        let filter: FlashSaleSeller[] = flashSale.value;
        if (status) {
            const filterStatus = status.toLowerCase();
            filter = filter.filter(FS => FS.status?.toLowerCase() == filterStatus);
        }
        if (searchTime) {
            const target = new Date(searchTime); 
        
            displayFlashSale.value = filter.filter(FS => {
                const start = new Date(FS.start_date);
                const end = new Date(FS.end_date);
                return target >= start && target <= end;
            })
        }
        else {
            displayFlashSale.value = filter;
        }
    }
    
    const getFlashSaleSeller = async (status: string) => {
        flashSale.value = [];
        error.value = null;
        loading.value = true;
        isSuccess.value = false;
        try {
            const res = await getFlashSaleForSeller(status);
            flashSale.value = res.data;
            isSuccess.value = true;
        } catch (err) {
            isSuccess.value = false;
            console.log(err);
        } finally {
            loading.value = false;
        }
    }
    
    const cancelAllFlashSaleItemStore = async (flash_sale_id: number) => {
        error.value = null;
        loading.value = true;
        isSuccess.value = false;
        try {
            const res = await cancelAllFlashSaleItem(flash_sale_id);
            isSuccess.value = true;
            return res;
        } catch (err) {
            console.log(err);
            isSuccess.value = false;
        } finally {
            loading.value = false;
        }
    }
    return { loading, isSuccess, displayFlashSale, filterFlashSale, error, flashSale, flashSaleHome, getFlashSaleSeller, getFlashSaleSellerHome, cancelAllFlashSaleItemStore };
})



