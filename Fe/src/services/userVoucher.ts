import api from "./api";

export const saveVoucher = async (voucher_id: number) => {
    const response = await api.post(`/userVoucher/${voucher_id}`);
    return response.data;
};