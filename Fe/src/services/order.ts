import api from "./api";
import type { OderPayLoad } from '../interfaces/order';

export const createOrderAPI = async (payload: OderPayLoad) => {
  const res = await api.post(`/order/createOrder`, {
        orderItems:payload.orderItems,
        voucherCode:payload.order.voucher_code,
        shippingName:payload.order.shipping_name,
        shippingAddress:payload.order.shipping_address,
        shippingPhone:payload.order.shipping_phone,
        methodPayment:payload.order.payment_method
    });

    return res.data; 
};

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
