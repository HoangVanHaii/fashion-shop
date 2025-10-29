import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { cancel, complete, confirm, dispatch, getOrderOfShopMe } from "../../services/sellers/order";
import type { GetOrder } from "../../interfaces/order";

export const useOrderSellerStore = defineStore("orderSeller", () => {
    const listOrder = ref<GetOrder[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const success = ref<string | null>(null);

    const searchText = ref<string>("");
    const selectedStatus = ref<string>("Tất cả");

    const reverseStatusMap: Record<string, string> = {
        "Tất cả": "all",
        "Chờ xác nhận": "pending",
        "Chờ lấy hàng": "confirmed",
        "Đang giao hàng": "shipped",
        "Hoàn thành": "completed",
        "Đã hủy": "cancelled",
    };
    const getOrderOfShopMeStore = async () => {
        loading.value = true;
        error.value = null;
        try {
            const data = await getOrderOfShopMe();
            listOrder.value = data;
            return data;
        } catch (err) {
            console.error(err);
            error.value = "Không thể tải danh sách đơn hàng";
        } finally {
            loading.value = false;
        }
    };

    const filteredOrderByStatus = computed(() => {
        const statusKey = reverseStatusMap[selectedStatus.value];
        if (statusKey === "all") return listOrder.value;
        return listOrder.value.filter((o) => o.status === statusKey);
    });

    const normalizeText = (str: any) =>
        String(str ?? "") 
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();


    const filteredOrder = computed(() => {
        const keyword = normalizeText(searchText.value);
        const orders = filteredOrderByStatus.value; 

        if (!keyword) return orders;

        if (/^\d+$/.test(keyword)) {
            return orders.filter(order =>
                order.order_id.toString().includes(keyword)
            );
        }
        return orders.filter(order => {
            return order.items.some(item =>
                normalizeText(item.product_name).includes(keyword)
            );
        });
    });


    const resetFilter = () => {
        searchText.value = "";
        selectedStatus.value = "Tất cả";
    };

    const cancelStore = async (order_id: number) => {
        error.value = null;
        loading.value = true;
        try {
            await cancel(order_id);
            listOrder.value = listOrder.value.map((o) =>
                o.order_id === order_id ? { ...o, status: "cancelled" } : o
            );
            success.value = "Đã hủy đơn hàng thành công!"
        } catch (err:any) {
            error.value = err.message || "Không thể hủy đơn hàng"; 
        } finally {
            loading.value = false;
        }
    }
    const confirmStore = async (order_id: number) => {
        error.value = null;
        loading.value = true;
        try {
            await confirm(order_id);
            listOrder.value = listOrder.value.map((o) =>
                o.order_id === order_id ? { ...o, status: "confirmed" } : o
            );
            success.value = "Xác nhận đơn hàng thành công!"
        } catch (err: any) {
            error.value = err.message || "Không thể xác nhận đơn hàng";
        } finally {
            loading.value = false;
        }
    }
    const dispatchStore = async (order_id: number) => {
        error.value = null;
        loading.value = true;
        try {
            await dispatch(order_id);
            listOrder.value = listOrder.value.map((o) =>
                o.order_id === order_id ? { ...o, status: "shipped" } : o
            );
            success.value = "Lấy hàng thành công!"
        } catch (err: any) {
            error.value = err.message || "Chưa thể lấy đơn hàng";
        } finally {
            loading.value = false;
        }
    }
    const completeStore = async (order_id: number) => {
        error.value = null;
        loading.value = true;
        try {
            await complete(order_id);
            listOrder.value = listOrder.value.map((o) =>
                o.order_id === order_id ? { ...o, status: "completed" } : o
            );
            success.value = "Hoàn thành đơn hàng thành công!"
        } catch (err: any) {
            error.value = err.message || "Không thể hoàn thành đơn hàng";
        } finally {
            loading.value = false;
        }
    }

    return {
        listOrder,
        loading,
        error,
        success,
        searchText,
        selectedStatus,
        filteredOrder,
        getOrderOfShopMeStore,
        resetFilter,
        cancelStore,
        confirmStore,
        dispatchStore,
        completeStore
    };
});
