import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { FavouriteSummary } from "../interfaces/favourite";
import { createFavourite, deleteFavouriteOfme, getFavouriteOfme } from "../services/favourite";

export const useFavouriteStore = defineStore("favourite", () => {
    const listFavourite = ref<FavouriteSummary[]>([]);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const searchText = ref<string>("");

    const searchFilteredFavourite = computed(() => {
        if (!searchText.value.trim()) return listFavourite.value;
        const keyword = normalizeText(searchText.value);
        return listFavourite.value.filter(shop =>
            shop.products.some(p => normalizeText(p.product_name).includes(keyword))
        );
    });

    const getFavouriteOfMeStore = async () => {
        loading.value = true;
        try {
            const data = await getFavouriteOfme();
            listFavourite.value = data;
            return data as FavouriteSummary[];
        } catch (err) {
            console.log(err);
            error.value = "Không thể tải danh sách yêu thích";
        } finally {
            loading.value = false;
        }
    };

    const deleteFavouriteStore = async (product_id: number) => {
        loading.value = true;
        error.value = null;
        try {
            await deleteFavouriteOfme(product_id);
            listFavourite.value = listFavourite.value
                .map(shop => ({
                    ...shop,
                    products: shop.products.filter(p => p.product_id !== product_id),
                }))
                .filter(shop => shop.products.length > 0);
        } catch (err) {
            console.log(err);
            error.value = "Xóa sản phẩm khỏi mục yêu thích thất bại";
        } finally {
            loading.value = false;
        }
    };

    const addFavouriteStore = async (product_id: number) => {
        loading.value = true;
        error.value = null;
        try {
            await createFavourite(product_id);
            await getFavouriteOfMeStore();
        } catch (err) {
            console.log(err);
            error.value = "Thêm sản phẩm vào yêu thích thất bại";
        } finally {
            loading.value = false;
        }
    };


    const isFavourite = (productId: number) => {
        return listFavourite.value.some(shop =>
            shop.products.some(product => product.product_id === productId)
        );
    };
    function normalizeText(str: string): string {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    return {            
        listFavourite,
        searchText,
        searchFilteredFavourite,
        loading,
        error,
        getFavouriteOfMeStore,
        deleteFavouriteStore,
        isFavourite,
        addFavouriteStore
    };
});
