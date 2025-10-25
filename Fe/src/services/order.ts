import api from "./api";

export const getOrderOfMe = async () => {
    const token = localStorage.getItem('accessToken');
    const response = await api.get('/order/getOrderOfme', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};
export const getOrderById = async (id: number) => {
    const token = localStorage.getItem('accessToken');
    const response = await api.get(`/order/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

export const cancelledOrder = async (id: number) => {
    const token = localStorage.getItem('accessToken');
    const response = await api.put(
        `/order/cancelOrderByUser`,
        { order_id: id },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};


