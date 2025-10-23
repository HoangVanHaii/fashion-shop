import { type FlashSale, type FlashSaleProductSold } from "../interfaces/flashSale";
import {getFlashSale, getTotalSoldFlashSaleById, getFlashSaleNotIn } from "../services/flashSale";
import { ref } from "vue";
import { defineStore } from "pinia";

export const flashSaleStore = defineStore("flashSale", () => {
    const flashSales = ref<FlashSale | null>(null);
    const hotDeal1 = ref<FlashSale | null>(null);
    const hotDeal2 = ref<FlashSale | null>(null);
    const error = ref<string | null>(null);
    const loading = ref<boolean>(true);
    const totalSolds = ref<FlashSaleProductSold[]>([]);

    const getFlashSaleHome = async () => {
        flashSales.value = null;
        error.value = null;
        loading.value = true;
        try {
            const data = await getFlashSale();
              
            flashSales.value =  {
                ...data.flash_sale,
                Products: data.products  
            }
        } catch (err) {
            console.log(err);
        } finally {
            loading.value = false;
        }
    }
    const getFlashSaleHotDeal1NotIN = async (excludeId: string) => {
        loading.value = true;
        hotDeal1.value = null;
        error.value = null;
        try {
            const data = await getFlashSaleNotIn(excludeId);
            hotDeal1.value =  {
                ...data.flash_sale,
                Products: data.products
            }
        } catch (err) {
            console.log(err);
        } finally {
            loading.value = false
        }
    }
    const getFlashSaleHotDeal2NotIN = async (excludeId: string) => {
        hotDeal2.value = null;
        error.value = null;
        loading.value = true;
        try {
            const data = await getFlashSaleNotIn(excludeId);
            hotDeal2.value =  {
                ...data.flash_sale,
                Products: data.products
            }
        } catch (err) {
            console.log(err);
        } finally {
            loading.value = false;
        }
    }
    const getTotalSoldFlashSaleByIdStore = async () => {
        totalSolds.value = [];
        loading.value = true;
        try {
            const result = await getTotalSoldFlashSaleById(4);
            totalSolds.value = result.data;
        } catch (err) {
            console.log(err);
        } finally {
            loading.value = false;
        }
    }
    return { loading, error, flashSales, hotDeal1, hotDeal2, totalSolds, getFlashSaleHome, getTotalSoldFlashSaleByIdStore, getFlashSaleHotDeal1NotIN, getFlashSaleHotDeal2NotIN}
})



