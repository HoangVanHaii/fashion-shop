import axios from "axios";

export const searchByCategoryGender = async (gender: string) => {
    const response = await axios.get(`http://localhost:3000/api/product/searchByCategoryGender?gender=${gender}`);
    console.log(response.data);
    return response.data;
};