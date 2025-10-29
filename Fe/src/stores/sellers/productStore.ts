import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { ProductPayload } from "../../interfaces/product";
import { getProductPayloadOfShop, updateSizes, updateStatus } from "../../services/sellers/product";
export const useProductSellerStore = defineStore('product-seller', () => {
    const loading = ref<boolean>(true);
    const listProduct = ref<ProductPayload[]>([]);
    const selectedStatus = ref<string>("Tất cả");

    const reverseStatusMap: Record<string, string> = {
        "Tất cả": "all",
        "Đang hoạt động": "active",
        "Vi phạm": "banned",
        "Chưa hiển thị": "hidden"
    };
    const getAllProductPayloadStore = async () => {
        loading.value = true;
        try {
            const result = await getProductPayloadOfShop();
            listProduct.value = result;
            return result as ProductPayload[];
        } catch (err) {
            console.log(err);
        } finally {
            loading.value = false;
        }
    }
     const filteredProductByStatus = computed(() => {
            const statusKey = reverseStatusMap[selectedStatus.value];
            if (statusKey === "all") return listProduct.value;
            return listProduct.value.filter((p) => p.status === statusKey);
    });
    
    const quantityActive = computed(() =>
        listProduct.value.filter(p => p.status === "active").length
    );
    const quantityHidden = computed(() =>
        listProduct.value.filter(p => p.status === "hidden").length
    );
    const quantityBanned = computed(() =>
        listProduct.value.filter(p => p.status === "banned").length
    );
    const updateStatusStore = async (status: string, product_id: string) => {
        try {
            loading.value = true;
            await updateStatus(status, product_id);
        } catch (error) {
            console.log(error);
        } finally {
            loading.value = false;
        }
    }
    const updateSizesStore = async (sizes: string, stock: number) => {
        try {
            loading.value = true;
            await updateSizes(sizes, stock);
        } catch (error) {
            console.log(error);
        } finally {
            loading.value = false;
        }
    }
    return { getAllProductPayloadStore, updateStatusStore, updateSizesStore, filteredProductByStatus, listProduct, loading, selectedStatus, quantityActive, quantityBanned, quantityHidden };
})
