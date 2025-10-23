import type { Voucher } from "../interfaces/voucher";
import { getTop4Voucher, getAllVoucher, getVoucherByCode, getVoucherById } from "../services/voucher";
import { defineStore } from "pinia";

export const voucherStore = defineStore("voucher", () => {

    const getTop4VoucherGlobal = async () => {

        try {
            const data = await getTop4Voucher(4, "global");
            return data.vouchers;
        } catch (err) {
            console.log(err);
        }
    }
    const getAllVoucherStore = async () => {
        try {
            const result = await getAllVoucher();
            return result.vouchers;
        } catch (err) {
            console.log(err);
        }
    }
    const getVoucherByCodeStore = async(code: string) => {
        try {
            const result = await getVoucherByCode(code);
            return result.voucher as Voucher;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
    const getVoucherByIdStore = async(id: number) => {
        try {
            const result = await getVoucherById(id)
            return result.voucher;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
    return { getTop4VoucherGlobal, getAllVoucherStore, getVoucherByCodeStore, getVoucherByIdStore}
})



