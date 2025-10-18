import { defineStore } from "pinia";
import { getCartCount } from "../services/cart";

export const useCartStore = defineStore('cart', () => {
    const getCartCountStore = async () => {{
        try {
            const res = await getCartCount();
            const count = typeof res.data === "number" ? res.data : (res.data?.count ?? 0);
            return count;
        } catch (error) {
            console.error("Failed to fetch cart count:", error);
            return 0;
        }
    }}
    return {getCartCountStore};
})
