import axios from "axios";
import Cookies from "js-cookie";
import { BASE_URL } from "../utils/constants.js";
import { saveTokens, clearTokens } from "../utils/auth.js";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Enable sending cookies with requests
});

// Interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get("refreshToken");
        if (refreshToken) {
          const response = await api.post("/auth/refresh", {
            token: refreshToken,
          });
          const { token, refreshToken: newRefreshToken } = response.data;
          saveTokens(token, newRefreshToken);
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        clearTokens();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
