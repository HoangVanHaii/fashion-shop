import { ref } from "vue";
import { defineStore } from "pinia";
import type { SellerRequest, User } from "../../interfaces/user";
import { getAllSellerRequest, getAllUser } from "../../services/admin/user";
export const useAdminStore = defineStore("admin", () => {
    const ListUser = ref<User[]>([]);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);
    const ListSellerRequest = ref<SellerRequest[]>([]);

    const getAllUserStore = async () => {
        loading.value = true;
        try {
            const data = await getAllUser();
            ListUser.value = data.data;
        } catch (err) {
            console.log(err);
            error.value = "Không thể tải danh sách người dùng";
        } finally {
            loading.value = false;
        }
    };
    
    const getAllSellerRequestStore = async () => {
        loading.value = true;
        try {
            const data = await getAllSellerRequest();
            ListSellerRequest.value = data.data;
        } catch (err) {
            console.log(err);
            error.value = "Không thể tải danh sách sellerRequest";
        } finally {
            loading.value = false;
        }
    };

    return {            
        getAllUserStore,
        getAllSellerRequestStore,
        loading,
        error,
        ListUser,
        ListSellerRequest
    };
});
