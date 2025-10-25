import api from "./api";

export const searchByCategoryGender = async (gender: string) => {
    const response = await api.get(`/product/searchByCategoryGender?gender=${gender}`);
    return response.data;
};
export const getProductById = async (id: number) => {
    const response = await api.get(`/product/${id}`);
    return response.data;
}
export const getProductByCategory = async (categoryName: string) => {
    const response = await api.get(`/product/searchByCategory?categoryNames=${categoryName}`);
    return response.data;
}
export const getProductBestSeller = async (id: number) => {
    const result = await api.get(`/product/best-sellers?limit=${id}`);
    return result.data;
}
export const getProductLatest = async (id: number) => {
    const result = await api.get(`/product/latest?limit=${id}`);
    return result.data;
}
export const getProductByName = async (name: string) => {
    const result = await api.get(`/product/searchByName?name=${name}`);
    return result.data;
}
export const getProductByShop = async (id: number) => {
    const result = await api.get(`/product/searchByShop?shop_id=${id}`);
    return result.data;
}
