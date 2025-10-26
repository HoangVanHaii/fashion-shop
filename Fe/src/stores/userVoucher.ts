import { defineStore } from "pinia";
import { saveVoucher, getVoucherUserByUserId } from "../services/userVoucher";
import type { UserVoucherDetail } from "../interfaces/userVoucher";
import { ref } from "vue";

export const useVoucherStore = defineStore('userVoucher', () => {
    const listUserVoucher = ref<UserVoucherDetail[]>([]);
    const saveVoucherStore = async (voucher_id: number) => {{
        try {
            const res = await saveVoucher(voucher_id);
            return res.data;
        } catch (error) {
            console.error("Failed Save Voucher:", error);
            // return 0;
        }
    }
    }
    const getVoucherUserByUserIdStore = async () => {
        listUserVoucher.value = [];
        try {
            const res = await getVoucherUserByUserId();
            listUserVoucher.value = res.data;
            // return res.data;

        } catch (error) {
            // console.error("Failed to fetch cart count:", error);
            // return 0;
        }
    }
    return { listUserVoucher, saveVoucherStore, getVoucherUserByUserIdStore };
})

