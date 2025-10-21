import axios from "axios";

export const getProductBestSeller = async (id: number) => {
    const result = await axios.get(`http://localhost:3000/api/product/best-sellers?limit=${id}`);
    return result.data;
}
export const getProductLatest = async (id: number) => {
    const result = await axios.get(`http://localhost:3000/api/product/latest?limit=${id}`);
    return result.data;
}
