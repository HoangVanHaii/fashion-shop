import { defineStore } from "pinia";
import { ref } from "vue";
import { registerSendOTP } from "../services/user";
import { verifyRegister, loginUser, getUserById, getShopByid, getShopName } from "../services/user";
import type { User } from "../interfaces/user";

export const useAuthStore = defineStore('auth', () => {
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const success = ref<string | null>(null)
    const OTP = ref<string | null>(null);
    const isLogin = ref<boolean>(false);
    const user = ref<User | null> (null);

    const registerSendOtpStore = async (name: string, email: string, phone: string, password: string, dateOfBirth: string) => {
        try {
            loading.value = true;
            error.value = null;
            success.value = null;

            const otp = await registerSendOTP(name, email, phone, password, dateOfBirth);
            success.value = `Vui lòng xác nhận OTP đã gửi đến ${email}`;
            OTP.value = otp;

        } catch (err: any) {
            const status = err.response?.status;
            const errors = err.response?.data?.errors;
            if (status === 409) {
                error.value = `Email ${email} đã tồn tại`;
            } else if (status === 400 && Array.isArray(errors)) {
                const messages = errors.map((e: any) => e.msg);
                error.value = messages[0];
            } else {
                error.value = 'Lỗi máy chủ';
            }

            success.value = `Không thể gửi OTP đến email ${email}`;
        } finally {
            loading.value = false;
        }
    };

    const verifyRegisterStore = async (email: string, otp: string) => {
        try {
            loading.value = true
            error.value = null
            success.value = null

            await verifyRegister(email, otp);
            
            success.value = `Đăng ký thành công`
        } catch (err: any) {
            const status = err.response?.status;
            if( status == 400) {
                error.value = `OTP không hợp lệ!`;
            } else {
                error.value = 'Lỗi máy chủ'
            }
        } finally {
            loading.value = false;
        }
    }

    const loginStore = async (email: string, password: string) => {
        loading.value = true;
        error.value = null;
        success.value = null;
        isLogin.value = false;
        user.value = null;

        try {
            const data = await loginUser(email, password);

            user.value = data.data.user;
            localStorage.setItem("accessToken", data.data.accessToken);
            localStorage.setItem("refreshToken", data.data.refreshToken);
            localStorage.setItem("user_id", data.data.user.id);
            isLogin.value = true;

            success.value = "Đăng nhập thành công";
        } catch (err: any) {
            const status = err.response?.status || 500;
            switch (status) {
                case 400:
                    error.value = "Dữ liệu không hợp lệ!";
                    break;
                case 404:
                    error.value = "Email không tồn tại!";
                    break;
                case 403:
                    error.value = "Tài khoản đã bị khóa!";
                    break;
                case 401:
                    error.value = "Sai mật khẩu!"
                    break;                        
                default:
                    error.value = "Lỗi máy chủ!"
                    break;
            }
        }
        finally {
            loading.value = false;
        }
    };
    const getShopNameStore = async (product_id: number) => {
        try {
            const shopName = await getShopName(product_id);
            console.log(shopName.data.shoName);
            return shopName.data.shopName;
        } catch (error) {
            console.log(`Failed to fetch product shop name`);
        }
    }
    const getUserByIdStore = async (id: number) => {
        try {
            const data = await getUserById(id);
            return data;
        } catch (error) {
            console.error("Failed to get user by ID:", error);
        }
    }

    const getShopByidStore = async (id: number) => {
        try {
            const data = await getShopByid(id);
            console.log(data);
            return data.data;
        } catch (error) {
            console.error("Failed to get user by ID:", error);
        }
    }

    return {
        OTP,
        loading,
        user,
        error,
        success,
        registerSendOtpStore,
        verifyRegisterStore,
        loginStore,
        getUserByIdStore,
        getShopByidStore,
        getShopNameStore
    }
})
