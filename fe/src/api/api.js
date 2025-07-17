import axios from "axios";
import Cookies from "js-cookie";
import { BASE_URL } from "../utils/constants.js";
import { saveTokens, clearTokens } from "../utils/auth.js";

// Tạo instance axios
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Gửi cookie (ví dụ refreshToken) nếu backend cần
});

// ✅ Interceptor request – tự động gắn Authorization header cho mỗi request
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor response – xử lý khi token hết hạn, tự refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi là 401 (Unauthorized) hoặc 302 (Redirect) và chưa retry
    if (
      (error.response?.status === 401 || error.response?.status === 302) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refreshToken");

        if (refreshToken) {
          // Gửi yêu cầu refresh token
          const response = await api.post("/auth/refresh", {
            token: refreshToken,
          });

          const { token, refreshToken: newRefreshToken } = response.data;

          // Lưu token mới
          saveTokens(token, newRefreshToken);

          // Cập nhật header cho request cũ và retry
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        clearTokens();
        window.location.href = "/login"; // Điều hướng về login nếu refresh fail
      }
    }

    return Promise.reject(error);
  }
);

export default api;
