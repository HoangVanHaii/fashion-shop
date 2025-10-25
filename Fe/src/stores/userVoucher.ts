import { defineStore } from "pinia";
import { saveVoucher } from "../services/userVoucher";
export const useVoucherStore = defineStore('voucher', () => {
    const saveVoucherStore = async (voucher_id: number) => {{
        try {
            const res = await saveVoucher(voucher_id);
            return res.data;
        } catch (error) {
            // console.error("Failed to fetch cart count:", error);
            // return 0;
        }
    }}
    return { saveVoucherStore };
})
