import axios from "axios";
export const loginUser = async (email:string, password: string) => {
    const result = await axios.post('http://localhost:3000/api/user/login', {
        email,
        password
    })
    return result.data;
}
export const registerSendOTP = async (name: string, email:string, phone: string, password:string, dateOfBirth: string) => {
    const result = await axios.post('http://localhost:3000/api/user/register', {
        name,
        email,
        phone,
        password,
        dateOfBirth
    })
    return result.data;
}

export const verifyRegister = async(email: string, otp: string) => {
    const response = await axios.post('http://localhost:3000/api/user/verifyRegister',{
        email,
        otp
    })
    return response.data

}
export const resendOTP = async (email: string) => {
    const response = await axios.post('http://localhost:3000/api/user/resendOTP', { email });
    return response.data;
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
    const response = await axios.post('http://localhost:3000/api/user/resetPassword', {
        email,
        otp,
        newPassword,
    });
    return response.data;
};


