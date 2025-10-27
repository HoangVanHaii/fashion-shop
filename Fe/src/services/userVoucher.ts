import api from "./api";

export const saveVoucher = async (voucher_id: number) => {
    const response = await api.post(`/userVoucher/claim/${voucher_id}`);
    return response.data;
};
export const getVoucherUserByUserId = async () => {
    const response = await api.get(`/userVoucher`);
    return response.data;
};