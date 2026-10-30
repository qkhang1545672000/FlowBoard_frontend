import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động lấy cookie __Secure-better-auth.session_token và nhét vào Header
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Lấy chính xác tên cookie secure của Better Auth khi chạy trên production
    const token =
      Cookies.get("__Secure-better-auth.session_token") ||
      Cookies.get("better-auth.session_token");

    if (token) {
      // Gửi dưới dạng Bearer Token để Backend trên Render đọc được dễ dàng
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      toast.error("Bạn cần đăng nhập để tiếp tục");

      if (typeof window !== "undefined") {
        window.location.href = "/auth/signin";
      }
    }

    if (error.response?.status === 403) {
      toast.error("Bạn không có quyền thực hiện thao tác này");
    }

    if (!error.response) {
      toast.error("Không kết nối được máy chủ, vui lòng thử lại sau");
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
