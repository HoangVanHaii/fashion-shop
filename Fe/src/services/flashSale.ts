import api from "./api";

export const getFlashSale = async () => {
    const result = await api.get(`/flashSale/newFlashSale`);
    return result.data;
}
export const getTotalSoldFlashSaleById = async (id: number) => {
    const result = await api.get(`/flashSale/totalSold/${id}`);
    return result.data;
}
export const getFlashSaleNotIn = async (excludeId: string) => {
    const result = await api.get(`/flashSale/activeNotIn/?excludeIds=${excludeId}`);
    return result.data;
}