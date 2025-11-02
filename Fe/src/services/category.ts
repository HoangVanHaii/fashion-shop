import api from "./api";

export const getCategoryName = async (gender: string) => {
    const response = await api.get(`/category/categoryName?gender=${gender}`);
    return response.data;
};
export const getActiveCategory = async () => {
    const response = await api.get(`/category/active`);
    return response.data;
};