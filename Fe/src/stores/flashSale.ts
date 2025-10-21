import { type FlashSale, type FlashSaleProductSold } from "../interfaces/flashSale";
import {getFlashSale, getTotalSoldFlashSaleById, getFlashSaleNotIn } from "../services/flashSale";
import { ref } from "vue";
import { defineStore } from "pinia";

export const flashSaleStore = defineStore("flashSale", () => {
    const flashSales = ref<FlashSale | null>(null);
    const hotDeal1 = ref<FlashSale | null>(null);
    const hotDeal2 = ref<FlashSale | null>(null);
    const error = ref<string | null>(null);
    const totalSolds = ref<FlashSaleProductSold[]>([]);
    const getFlashSaleHome = async () => {
        flashSales.value = null;
        error.value = null;
        try {
            const data = await getFlashSale();
              
            flashSales.value =  {
                ...data.flash_sale,
                Products: data.products  
            }

        } catch (err) {
            console.log(err);
        }
    }
    const getFlashSaleHotDeal1NotIN = async (excludeId: string) => {
        
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
        }
    }
    const getFlashSaleHotDeal2NotIN = async (excludeId: string) => {
        hotDeal2.value = null;
        error.value = null;
        try {
            const data = await getFlashSaleNotIn(excludeId);
            hotDeal2.value =  {
                ...data.flash_sale,
                Products: data.products
            }
        } catch (err) {
            console.log(err);
        }
    }
    const getTotalSoldFlashSaleByIdStore = async () => {
        totalSolds.value = [];
        try {
            const result = await getTotalSoldFlashSaleById(4);
            totalSolds.value = result.data;
        } catch (err) {
            console.log(err);
        }
    }
    return { error, flashSales, hotDeal1, hotDeal2, totalSolds, getFlashSaleHome, getTotalSoldFlashSaleByIdStore, getFlashSaleHotDeal1NotIN, getFlashSaleHotDeal2NotIN}
})



