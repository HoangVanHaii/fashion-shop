import axios from "axios";

export const getFlashSale = async () => {
    const result = await axios.get(`http://localhost:3000/api/flashSale/newFlashSale`);
    return result.data;
}
export const getTotalSoldFlashSaleById = async (id: number) => {
    const result = await axios.get(`http://localhost:3000/api/flashSale/totalSold/${id}`);
    return result.data;
}
export const getFlashSaleNotIn = async (excludeId: string) => {
    const result = await axios.get(`http://localhost:3000/api/flashSale/activeNotIn/?excludeIds=${excludeId}`);
    return result.data;
}