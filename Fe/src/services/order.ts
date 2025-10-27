import axios from 'axios';
import type { OderPayLoad } from '../interfaces/order';

const API_URL = 'http://localhost:3000/api/order';


export const createOrderAPI = async (payload: OderPayLoad) => {
  try {
    const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJvdm5ob2thQGdtYWlsLmNvbSIsInJvbGUiOiJzZWxsZXIiLCJpYXQiOjE3NjE0OTgyNjEsImV4cCI6MTc2MTUwMTg2MX0.4dO2wBuXvdKddAZAxlqihGdzsfEh_br_Ed9HhNK2hX4"
    const res = await axios.post(`${API_URL}/createOrder`, {
        orderItems:payload.orderItems,
        voucherCode:payload.order.voucher_code,
        shippingName:payload.order.shipping_name,
        shippingAddress:payload.order.shipping_address,
        shippingPhone:payload.order.shipping_phone,
        methodPayment:payload.order.payment_method
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return res.data; 
  } catch (error: any) {
    console.error('Lỗi khi tạo order:', error.response?.data || error.message);
    throw error;
  } 
};
