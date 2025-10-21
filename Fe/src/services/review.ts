import axios from "axios";

export const getReviewsByProductId = async (product_id: number) => {
    const response = await axios.get(`http://localhost:3000/api/review/product/${product_id}`);
    return response.data;
};