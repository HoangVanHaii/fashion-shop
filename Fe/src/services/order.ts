import axios from "axios";

export const getOrderOfMe = async () => {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get('http://localhost:3000/api/order/getOrderOfme', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};
