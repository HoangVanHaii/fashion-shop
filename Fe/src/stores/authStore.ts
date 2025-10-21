import { login } from "../services/login";
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from "../interfaces/user";

export const useAuthStore = defineStore("auth", () => {
    const user = ref<User | null>(null);
    const accessToken = ref<string | null>(null);
    const loading = ref(false);
    const success = ref<string | null>(null)
    const isLogin = ref(false);
    const error = ref<string | null>(null);

    const loginStore = async (email: string, password: string) => {
        loading.value = true;
        error.value = null;
        success.value = null;
        isLogin.value = false;
        user.value = null;

        try {
            const data = await login(email, password);
            user.value = data.user;
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
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
    return { user, accessToken, loading, success, isLogin, error, loginStore };
})