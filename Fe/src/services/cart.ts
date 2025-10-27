import type { Cart } from '../interfaces/cart'

import api from "./api";

export const getCartCount = async () => {
    const token = localStorage.getItem('accessToken');

    const response = await api.get('/cart/getCountCart');

    return response.data;
};
export const addToCart = async (size_id: number, quantity: number) => {
    const token = localStorage.getItem('accessToken');

    const response = await api.post('/cart/addToCart', {
        size_id,
        quantity
    });
    return response.data;
}

export const fetchCartAPI = async (token: string): Promise<Cart> => {

    const res = await api.get('/cart')
    return res.data;
}

export const removeCartItemAPI = async (cartItemId: number): Promise<void> => {
    const res = await api.delete(`cart/removeItem/${cartItemId}`)
    return res.data;
}

export const updateSizeCartItemAPI = async (cart_item_id: number, size_id: number): Promise<void> => {
    const res = await api.put(`/cart/updateItem/${cart_item_id}`,
        { size_id }
    );
    return res.data;
};

export const updateCartItemQuantityAPI = async (cart_item_id: number, newQuantity: number): Promise<void> => {
    const res = await api.put(`/cart/updateItemQuantity/${cart_item_id}`,
        { quantity: newQuantity }
    );

    return res.data;
};
