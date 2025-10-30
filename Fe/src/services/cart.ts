import api from "./api";

export const getCartCount = async () => {

    const response = await api.get('/cart/getCountCart');

    return response.data;
};
export const addToCart = async (size_id: number, quantity: number) => {
    const response = await api.post('/cart/addToCart', {
        size_id,
        quantity
    });
    return response.data;
}

export const fetchCartAPI = async () => {

    const res = await api.get('/cart')
    return res.data;
}

export const removeCartItemAPI = async (cartItemId: number) => {
    const res = await api.delete(`cart/removeItem/${cartItemId}`)
    return res.data;
}

export const updateSizeCartItemAPI = async (cart_item_id: number, size_id: number)=> {
    const res = await api.put(`/cart/updateItem/${cart_item_id}`,
        { size_id }
    );
    return res.data;
};

export const updateCartItemQuantityAPI = async (cart_item_id: number, newQuantity: number) => {
    const res = await api.put(`/cart/updateItemQuantity/${cart_item_id}`,
        { quantity: newQuantity }
    );

    return res.data;
};
