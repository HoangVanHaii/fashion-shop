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
