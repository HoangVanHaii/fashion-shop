import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { getOrderOfMe, getOrderById, cancelledOrder, createOrderAPI } from "../services/order";
import type { GetOrder, OderPayLoad, Order } from "../interfaces/order";

export const useOrderStore = defineStore("order", () => {
    const listOrder = ref<GetOrder[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const success = ref<string | null>(null);
    const orderDetail = ref<GetOrder>();

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
    const getOrderByIdStore = async (id: number) => {
        loading.value = true
        try {
            const data = await getOrderById(id);
            orderDetail.value = data;
            return data as GetOrder;
        } catch (err) {
            console.log(err);
        } finally {
            loading.value = false
        }
    }
    const getOrderOfMeStore = async () => {
        loading.value = true;
        error.value = null;
        try {
            const data = await getOrderOfMe();
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

    const normalizeText = (str: string) =>
        str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();

    const filteredOrder = computed(() => {
        const keyword = normalizeText(searchText.value);
        if (!keyword) return filteredOrderByStatus.value;
        return filteredOrderByStatus.value.filter((order) => {
            const name = normalizeText(order.items[0]?.product_name || "");
            return name.includes(keyword);
        });
    });

    const resetFilter = () => {
        searchText.value = "";
        selectedStatus.value = "Tất cả";
    };

    const cancelledOrderStore = async (order_id: number) => {
        error.value = null;
        loading.value = true;
        try {
            await cancelledOrder(order_id);
            listOrder.value = listOrder.value.map((o) =>
                o.order_id === order_id ? { ...o, status: "cancelled" } : o
            );
            if (orderDetail.value) {
                orderDetail.value = { ...orderDetail.value, status: 'cancelled' };
            }
            success.value = "Đã hủy đơn hàng thành công!"
        } catch (err:any) {
            error.value = err.message || "Không thể hủy đơn hàng"; 
        } finally {
            loading.value = false;
        }
    }
    const currentOrder = ref<Order | null>(null) // order vừa tạo

    const createOrder = async (payload: OderPayLoad) => {
        error.value = null;
        try {
            const res = await createOrderAPI(payload)
            currentOrder.value = res
            return res;
        } catch (err:any) {
            console.log(err);
            error.value = err;
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
        orderDetail,
        getOrderOfMeStore,
        getOrderByIdStore,
        resetFilter,
        cancelledOrderStore,
        createOrder
    };
});
