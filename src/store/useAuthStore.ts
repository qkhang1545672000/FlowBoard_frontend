import { User } from "@/types/api.types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService } from "@/services/auth.services"; // Đảm bảo đường dẫn tới service của bạn là chính xác
import { toast } from "sonner";
import { io } from "socket.io-client"; // Hoặc cách bạn khởi tạo socket client

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearAuth: () => void;

  // Thêm action signOut vào store
  signOut: (redirectTo?: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setToken: (token) =>
        set({
          token,
        }),

      clearAuth: () =>
        set({
          user: null,
          isAuthenticated: false,
          token: null,
        }),

      // Tích hợp toàn bộ logic đăng xuất vào đây
      signOut: async (redirectTo = "/auth/signin") => {
        try {
          const currentUser = get().user;

          // 1. Chủ động bắn socket báo offline ngay khi bấm đăng xuất
          if (currentUser?.id) {
            try {
              // Khởi tạo socket kết nối tạm tới namespace /auth
              const socketUrl = process.env.NEXT_PUBLIC_API_URL || "";
              const socket = io(`${socketUrl}/auth`, { withCredentials: true });

              if (socket.connected) {
                socket.emit("user-offline", currentUser.id);
                setTimeout(() => socket.disconnect(), 300);
              } else {
                socket.once("connect", () => {
                  socket.emit("user-offline", currentUser.id);
                  setTimeout(() => socket.disconnect(), 300);
                });
              }
            } catch (socketErr) {
              console.error("Lỗi emit socket logout:", socketErr);
            }
          }

          // 2. Gọi API đăng xuất đến Backend (để xóa session trong DB và clear HttpOnly cookie)
          await authService.signOut().catch(() => {});
        } catch (error) {
          console.error("Lỗi khi gọi API signOut:", error);
        } finally {
          // 3. Clear state người dùng trong Zustand Store
          set({
            user: null,
            isAuthenticated: false,
            token: null,
          });

          // 4. Dọn dẹp các storage liên quan
          if (typeof window !== "undefined") {
            localStorage.removeItem("active-board-storage");
            localStorage.removeItem("bearer_token");
          }

          toast.success("Signed out successfully");

          // 5. Chuyển hướng về trang đăng nhập bằng window.location để reset sạch toàn bộ React/Query tree
          setTimeout(() => {
            window.location.href = redirectTo;
          }, 300);
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
