import api from "./api";
export const loginUser = async (email:string, password: string) => {
    const result = await api.post('/user/login', {
        email,
        password
    })
    return result.data;
}
export const registerSendOTP = async (name: string, email:string, phone: string, password:string, dateOfBirth: string) => {
    const result = await api.post('/user/register', {
        name,
        email,
        phone:phone,
        password,
        dateOfBirth
    })
    return result.data;
}

export const verifyRegister = async(email: string, otp: string) => {
    const response = await api.post('/user/verifyRegister',{
        email,
        otp
    })
    return response.data

}
export const resendOTP = async (email: string) => {
    const response = await api.post('/user/resendOTP', { email });
    return response.data;
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
    const response = await api.post('/user/resetPassword', {
        email,
        otp,
        newPassword,
    });
    return response.data;
};

export const getUserById = async (id: number) => {
    const response = await api.get(`/admin/${id}`);
    return response.data;
}
export const getNameById = async (id: number) => {
    const response = await api.get(`/user/getName/${id}`);
    return response.data;
}
export const getShopByid = async (id: number) => {
    const response = await api.get(`/user/shop/${id}`)
    return response.data;
}
export const getShopName = async (product_id: number) => {
    const response = await api.get(`/user/shop/nameByProduct/${product_id}`)
    return response.data;
}
