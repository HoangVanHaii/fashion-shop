import api from "../../services/api";

export const getFlashSaleForSeller = async (status : string) => {
    const result = await api.get(`/flashSale?status=${status}`);
    return result.data;
}
export const cancelAllFlashSaleItem = async (id: number) => {
    const result = await api.delete(`/flashSale/allFlashItem/${id}`)
    return result.data;
}