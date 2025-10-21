import { type Voucher } from "../interfaces/voucher";
import { getTop4Voucher, getAllVoucher } from "../services/voucher";
import { ref } from "vue";
import { defineStore } from "pinia";

export const voucherStore = defineStore("voucher", () => {
    const error = ref<string | null>(null);
    const vouchers = ref<Voucher[]>([]);
    const allVouchers = ref<Voucher[]>([]);
    const getTop4VoucherGlobal = async () => {
        vouchers.value = [];
        error.value = null;
        try {
            const data = await getTop4Voucher(4, "global");
            vouchers.value = data.vouchers;
        } catch (err) {
            console.log(err);
        }
    }
    const getAllVoucherStore = async () => {
        const result = await getAllVoucher();
        allVouchers.value = result;
    }
    return {error, vouchers, allVouchers, getTop4VoucherGlobal, getAllVoucherStore}
})



