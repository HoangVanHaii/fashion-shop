import axios from "axios";

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 9c6d26570948261e3149da8b70562790858fa8ef
export const searchByCategoryGender = async (gender: string) => {
    const response = await axios.get(`http://localhost:3000/api/product/searchByCategoryGender?gender=${gender}`);
    return response.data;
};
export const getProductById = async (id: number) => {
    const response = await axios.get(`http://localhost:3000/api/product/${id}`);
    return response.data;
}
export const getProductByCategory = async (categoryName: string) => {
    const response = await axios.get(`http://localhost:3000/api/product/searchByCategory?categoryNames=${categoryName}`);
    return response.data;
}
<<<<<<< HEAD
=======
=======
>>>>>>> 9c6d26570948261e3149da8b70562790858fa8ef
export const getProductBestSeller = async (id: number) => {
    const result = await axios.get(`http://localhost:3000/api/product/best-sellers?limit=${id}`);
    return result.data;
}
export const getProductLatest = async (id: number) => {
    const result = await axios.get(`http://localhost:3000/api/product/latest?limit=${id}`);
    return result.data;
}
<<<<<<< HEAD
>>>>>>> origin/main
=======
>>>>>>> 9c6d26570948261e3149da8b70562790858fa8ef
