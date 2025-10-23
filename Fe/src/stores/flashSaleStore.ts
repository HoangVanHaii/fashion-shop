import {getFlashSale, getTotalSoldFlashSaleById, getFlashSaleNotIn } from "../services/flashSale";
import { defineStore } from "pinia";

export const flashSaleStore = defineStore("flashSale", () => {
    const getFlashSaleHome = async () => {
        try {
            const data = await getFlashSale();
              
            return {
                ...data.flash_sale,
                Products: data.products  
            }

        } catch (err) {
            console.log(err);
        }
    }
    const getFlashSaleHotDeal1NotIN = async (excludeId: string) => {
        try {
            const data = await getFlashSaleNotIn(excludeId);
            return  {
                ...data.flash_sale,
                Products: data.products
            }
        } catch (err) {
            console.log(err);
        }
    }
    const getFlashSaleHotDeal2NotIN = async (excludeId: string) => {
        try {
            const data = await getFlashSaleNotIn(excludeId);
            return {
                ...data.flash_sale,
                Products: data.products
            }
        } catch (err) {
            console.log(err);
        }
    }
    const getTotalSoldFlashSaleByIdStore = async () => {
        try {
            const result = await getTotalSoldFlashSaleById(4);
            return result.data;
        } catch (err) {
            console.log(err);
        }
    }
    return { getFlashSaleHome, getTotalSoldFlashSaleByIdStore, getFlashSaleHotDeal1NotIN, getFlashSaleHotDeal2NotIN}
})



