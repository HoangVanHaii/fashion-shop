import api from "./api";

export const getFavouriteOfme = async () => {
    const token = localStorage.getItem('accessToken');
    const response = await api.get('/favourite/getFavouritesOfme', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};
export const createFavourite = async (product_id: number) => {
    const token = localStorage.getItem('accessToken');
    const response = await api.post('/favourite/createFavourite', {
        product_id
    },
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};
export const deleteFavouriteOfme = async (product_id: number) => {
    const token = localStorage.getItem('accessToken');
    const response = await api.delete(`/favourite/deleteFavourite/${product_id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};
