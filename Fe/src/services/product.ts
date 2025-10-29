import api from "./api";
import type { ProductPayload,ProductSize } from '../interfaces/product.ts'

export const getProductIdBySize = async (sizeId: number) =>{
    const res = await api.get(`/product/id-by-size/${sizeId}`);
    return res.data;
}

export const getProductSizesBySizeId = async (size_id: number): Promise<ProductSize> =>{
    const res = await api.get(`/product/size-detail/${size_id}`);
    const product_size = res.data;
    return product_size;
}

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
export const getAllProductActive = async () => {
    const result = await api.get(`http://localhost:3000/api/product/actives`);
    return result.data;
}
