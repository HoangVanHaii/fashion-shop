import api from ".././api";

export const getProductPayloadOfShop = async () => {
    const response = await api.get(`/seller/product/`);
    return response.data;
};

export const updateStatus = async (status: string, product_id: string) => {
    const response = await api.put(`/seller/product/updateStatus`, {
        status,
        product_id
    });
    return response.data;
};
export const updateSizes = async (sizes: string, stock: number) => {
    const response = await api.put(`/seller/product/updateSizes`, {
        sizes,
        stock
    });
    return response.data;
};