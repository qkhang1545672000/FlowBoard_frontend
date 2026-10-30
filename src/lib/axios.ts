import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Tự động đính kèm token vào mọi request gửi đi
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Lấy token từ localStorage (hoặc nơi bạn lưu trữ phiên đăng nhập/token của Better Auth)
    const token = localStorage.getItem("bearer_token"); // Thay đổi key này nếu project của bạn lưu tên khác
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 2. Xử lý response và lỗi trả về từ server
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      toast.error("Bạn cần đăng nhập để tiếp tục");

      if (typeof window !== "undefined") {
        // Dùng window.location.href thay cho redirect() để tránh crash client-side
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
