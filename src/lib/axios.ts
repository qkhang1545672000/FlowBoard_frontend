import axios, { AxiosError } from "axios";
import { getAuthClient } from "./auth/auth-client"; // file auth client của bạn
import { toast } from "sonner";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // https://flowboard-5qt4.onrender.com/api/v1
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor tự động gác token vào Header theo đúng chuẩn Bearer mà NestJS Guard đang đọc
axiosInstance.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    try {
      // Lấy session và token từ Better Auth Client
      const session = await getAuthClient().getSession();
      const token = session?.data?.session?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Không lấy được session token:", error);
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
      if (typeof window !== "undefined") {
        window.location.href = "/auth/signin";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
