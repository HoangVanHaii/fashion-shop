import api from "../../services/api";

export const getAllUser = async () => {
    const result = await api.get(`/admin?isVerified=true`);
    return result.data;
}

export const getAllSellerRequest = async () => {
    const result = await api.get(`/admin/sellerRequest`);
    return result.data;
}