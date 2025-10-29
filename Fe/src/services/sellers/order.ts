import api from "../api";

export const getOrderOfShopMe = async () => {
    const response = await api.get(`/seller/order/getOrderOfShopMe`);
    return response.data;
};
export const confirm = async (order_id: number) => {
    const response = await api.put(`/seller/order/confirm`, {
       order_id 
    });
    return response.data;
};
export const dispatch = async (order_id: number) => {
    const response = await api.put(`/seller/order/dispatch`, {
        order_id
    });
    return response.data;
};
export const complete = async (order_id: number) => {
    const response = await api.put(`/seller/order/complete`, {
        order_id
    });
    return response.data;
};
export const cancel = async (order_id: number) => {
    const response = await api.put(`/seller/order/cancel`, {
        order_id
    });
    return response.data;
};