import {type ProductSummary } from "../interfaces/product";
import { getProductLatest, getProductBestSeller } from "../services/product";
import { ref } from "vue";
import { defineStore } from "pinia";

export const productStore = defineStore("product", () => {
    const error = ref<string | null>(null);
    const productBestSellers = ref<ProductSummary[]>([]);
    const productLatest = ref<ProductSummary[]>([]);
    const getProductBestSellerStore = async () => {
        productBestSellers.value = [];
        try {
            const result = await getProductBestSeller(25);
            productBestSellers.value = result;
        } catch (err) {
            console.log(err);
        }
    }
    const getProductLatestStore = async () => {
        productLatest.value = [];
        try {
            const result = await getProductLatest(25);
            productLatest.value = result;
        } catch (err) {
            console.log(err);
        }
    }
    return {error, productBestSellers, productLatest, getProductBestSellerStore, getProductLatestStore}
})



