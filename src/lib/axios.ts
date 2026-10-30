import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  withCredentials: true, // Vẫn giữ để gửi cookie khi chạy local hoặc cross-site chuẩn
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Request Interceptor: Tự động gắn Bearer Token vào header nếu có
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Lấy token từ localStorage (hoặc nơi Better Auth lưu trữ token client-side)
    const token =
      localStorage.getItem("bearer_token") ||
      localStorage.getItem("better-auth.session_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 2. Response Interceptor: Xử lý lỗi 401, 403 an toàn bằng window.location
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      toast.error("Bạn cần đăng nhập để tiếp tục");

      if (typeof window !== "undefined") {
        // Dùng window.location.href để tránh lỗi crash do redirect() của next/navigation ở client side
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
