import { ref } from "vue";
import { defineStore } from "pinia";
import { getCartCount, addToCart } from "../services/cart";

export const useCartStore = defineStore('cart', () => {
    const success = ref<boolean>(false);
    const error = ref<string | null>(null);
    const cartCount = ref<number>(0);
    const loading = ref<boolean>(false);

    const getCartCountStore = async () => {{
        try {
            const res = await getCartCount();
            const count = typeof res.data === "number" ? res.data : (res.data?.count ?? 0);
            cartCount.value = count;
            return count;
        } catch (error) {
            console.error("Failed to fetch cart count:", error);
            return 0;
        }
    }
    }
    const addToCartStore = async (size_id: number, quantity: number) => {
        success.value = false;
        error.value = null;
        loading.value = true;
        try {
            const res = await addToCart(size_id, quantity); 
            success.value = true;
            loading.value = false;
            cartCount.value += 1;
            return res;
        } catch (err) {
            loading.value = false;
            error.value = "Failed to add to cart";
            console.error("Failed to add to cart:", err);
            // throw error;
        }
    }
    return { getCartCountStore , addToCartStore, success, error, loading, cartCount};
})
