import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

// 🪶 Thêm accessToken vào mỗi request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

// 🚀 Khi accessToken hết hạn (401)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi là 401 (Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token: string) => {
                        originalRequest.headers.Authorization = "Bearer " + token;
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                const { data } = await axios.post("http://localhost:3000/api/user/refreshToken", {
                    refreshToken,
                });

                // Lưu token mới
                localStorage.setItem("accessToken", data.accessToken);
                api.defaults.headers.Authorization = "Bearer " + data.accessToken;
                onRefreshed(data.accessToken);
                isRefreshing = false;

                // Gửi lại request cũ
                return api(originalRequest);
            } catch (err) {
                isRefreshing = false;
                // auth.loginStore(); // refreshToken cũng hết hạn thì logout
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
