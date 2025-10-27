import api from "./api";

export const getReviewsByProductId = async (product_id: number) => {
    const response = await api.get(`/review/product/${product_id}`);
    return response.data;
};