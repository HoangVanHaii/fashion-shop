import axios from "axios";

export const getCategoryName = async (gender: string) => {
    const response = await axios.get(`http://localhost:3000/api/category/categoryName?gender=${gender}`);
    return response.data;
};