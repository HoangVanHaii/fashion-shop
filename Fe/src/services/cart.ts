import axios from "axios";

export const getCartCount = async () => {
    const token = localStorage.getItem('accessToken');

    const response = await axios.get('http://localhost:3000/api/cart/getCountCart', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

export const addToCart = async (size_id: number, quantity: number) => {
    const token = localStorage.getItem('accessToken');

    const response = await axios.post('http://localhost:3000/api/cart/addToCart', {
        size_id,
        quantity
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}