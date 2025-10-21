import axios from "axios";

export const searchByCategoryGender = async (gender: string) => {
    const response = await axios.get(`http://localhost:3000/api/product/searchByCategoryGender?gender=${gender}`);
    return response.data;
};
export const getProductById = async (id: number) => {
    const response = await axios.get(`http://localhost:3000/api/product/${id}`);
    return response.data;
}
export const getProductByCategory = async (categoryName: string) => {
    const response = await axios.get(`http://localhost:3000/api/product/searchByCategory?categoryNames=${categoryName}`);
    return response.data;
}
export const getProductBestSeller = async (id: number) => {
    const result = await axios.get(`http://localhost:3000/api/product/best-sellers?limit=${id}`);
    return result.data;
}
export const getProductLatest = async (id: number) => {
    const result = await axios.get(`http://localhost:3000/api/product/latest?limit=${id}`);
    return result.data;
}
