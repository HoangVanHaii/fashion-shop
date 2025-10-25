import api from "./api";

export const getCartCount = async () => {
    const token = localStorage.getItem('accessToken');

    const response = await api.get('/cart/getCountCart', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

export const addToCart = async (size_id: number, quantity: number) => {
    const token = localStorage.getItem('accessToken');

    const response = await api.post('/cart/addToCart', {
        size_id,
        quantity
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}