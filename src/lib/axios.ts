import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Request Interceptor: Đính kèm Bearer Token nếu có sẵn trong store
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = useAuthStore.getState().token || localStorage.getItem("bearer_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 2. Response Interceptor: Xử lý lỗi tập trung
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const currentUser = useAuthStore.getState().user;

      // Nếu người dùng chưa đăng nhập hoặc đã đăng xuất thì bỏ qua không hiện toast phiền phức
      if (!currentUser) {
        return Promise.reject(error);
      }

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/auth/signin")
      ) {
        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
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
