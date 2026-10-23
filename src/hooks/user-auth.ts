import { authService } from "@/services/auth.services";
import { workSpaceService } from "@/services/workspace.service";
import { useAuthStore } from "@/store/useAuthStore";

import {
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  User,
} from "@/types/api.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
// 👉 Import socket.io-client để emit sự kiện logout realtime
import { useSocket } from "./useSocket";

type AuthToastMessages = {
  success?: string;
  error?: string;
};

export const useSignUp = (messages?: AuthToastMessages & { verifyEmail?: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser); // Lấy setter của Zustand

  return useMutation({
    mutationFn: (data: SignUpDto) => authService.signUp(data),

    onSuccess: (response) => {
      // 1. Cập nhật TanStack Query Cache
      queryClient.setQueriesData(
        { queryKey: ["auth", "session"] },
        {
          user: response.user,
          isGuest: false,
          isAuthenticated: true,
        },
      );

      // 2. Cập nhật dữ liệu vào Zustand Store
      setUser(response.user as User);

      if (response.token) {
        toast.success(messages?.success ?? "Account created successfully!");
        router.push("/product/catalo");
        return;
      }

      toast.info(
        messages?.verifyEmail ??
          messages?.success ??
          "Account created! Please check your email to verify your account.",
      );

      router.push("/auth/signin");
    },

    onError: (error: unknown) => {
      const message = (
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      )?.response?.data?.message;

      toast.error(
        typeof message === "string" ? message : (messages?.error ?? "Sign up failed"),
      );
    },
  });
};

export const useResendVerificationEmail = (messages?: AuthToastMessages) => {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerificationEmail(email),

    onSuccess: () => {
      toast.success(
        messages?.success ?? "Verification email sent! Please check your inbox.",
      );
    },

    onError: (error: unknown) => {
      const message = (
        error as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message;

      toast.error(
        typeof message === "string"
          ? message
          : (messages?.error ?? "Failed to send verification email"),
      );
    },
  });
};

export const useSignIn = (messages?: AuthToastMessages, redirectTo?: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser); // Lấy setter của Zustand

  const socket = useSocket("/auth");
  return useMutation({
    mutationFn: (data: SignInDto & { rememberMe?: boolean }) => authService.signIn(data),

    onSuccess: async (response) => {
      // 1. Cập nhật TanStack Query Cache cho session
      queryClient.setQueriesData(
        { queryKey: ["auth", "session"] },
        {
          user: response.user,
          isGuest: false,
          isAuthenticated: true,
        },
      );

      // Xử lý token mời (nếu có)
      localStorage.getItem("pending_invite_token");

      // 2. Cập nhật dữ liệu vào Zustand Store
      setUser(response.user as User);

      if (response.user && socket) {
        if (socket.connected) {
          // Nếu socket đang kết nối sẵn, emit và ngắt luôn
          socket.emit("user-online", response.user.id);
        } else {
          // Nếu chưa kết nối, đợi khi nào kết nối xong thì emit
          socket.once("connect", () => {
            socket.emit("user-online", response.user.id);
          });
        }
      }
      // 3. Xóa cache workspace cũ (nếu có từ tài khoản trước) để đảm bảo fetch data sạch
      queryClient.removeQueries({ queryKey: ["workspace"] });

      toast.success(messages?.success ?? "Sign in successful");

      // 4. Chuyển hướng về trang chủ / workspace.
      // Ngay khi sang trang mới, Layout chung chứa useAuthSocket sẽ tự động kết nối và báo online chuẩn xác!
      router.push(redirectTo ?? "/");
    },

    onError: (error: unknown) => {
      const message = (
        error as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message;

      toast.error(
        typeof message === "string" ? message : (messages?.error ?? "Sign in failed"),
      );
    },
  });
};
export const useSignOut = (messages?: AuthToastMessages, redirectTo?: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuthUser = useAuthStore((state) => state.clearAuth);
  const currentUser = useAuthStore((state) => state.user);
  const socket = useSocket("/auth");

  return useMutation({
    mutationFn: () => authService.signOut(),

    onSuccess: async () => {
      // ⚡ 1. Chủ động bắn socket báo offline ngay khi bấm đăng xuất
      try {
        const userId = currentUser?.id;
        if (userId && socket) {
          if (socket.connected) {
            // Nếu socket đang kết nối sẵn, emit và ngắt luôn
            socket.emit("user-offline", userId);
            setTimeout(() => socket.disconnect(), 300);
          } else {
            // Nếu chưa kết nối, đợi khi nào kết nối xong thì emit
            socket.once("connect", () => {
              socket.emit("user-offline", userId);
              setTimeout(() => socket.disconnect(), 300);
            });
          }
        }
      } catch (e) {
        console.error("Lỗi emit socket logout:", e);
      }

      // 2. Xóa TanStack Query Cache
      queryClient.cancelQueries();
      queryClient.setQueryData(["auth", "session"], null);

      queryClient.clear();

      // 3. Clear state người dùng trong Zustand Store
      if (clearAuthUser) {
        clearAuthUser();
      }

      // 4. Dọn dẹp storage
      localStorage.removeItem("active-board-storage");

      toast.success(messages?.success ?? "Signed out successfully");

      // 5. Chuyển hướng về trang đăng nhập
      router.push(redirectTo ?? "/auth/signin");
    },

    onError: (error: unknown) => {
      const message = (
        error as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message;

      toast.error(
        typeof message === "string" ? message : (messages?.error ?? "Sign out failed"),
      );
    },
  });
};

export const useForgotPassword = (messages?: AuthToastMessages) => {
  return useMutation({
    mutationFn: (data: ForgotPasswordDto) => authService.forgotPassword(data),

    onSuccess: () => {
      toast.success(messages?.success ?? "Password reset email sent!");
    },

    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;

      toast.error(
        typeof message === "string"
          ? message
          : (messages?.error ?? "Failed to send reset email"),
      );
    },
  });
};

export const useResetPassword = (messages?: AuthToastMessages) => {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: ResetPasswordDto) => authService.resetPassword(data),

    onSuccess: () => {
      toast.success(messages?.success ?? "Password reset successful!");
      router.push("/auth/signin");
    },

    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;

      toast.error(
        typeof message === "string"
          ? message
          : (messages?.error ?? "Password reset failed"),
      );
    },
  });
};

export const useGoogleSignIn = (messages?: { error?: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async (redirectPath?: string) => {
    try {
      setIsLoading(true);
      await authService.signInWithGoogle(redirectPath);
    } catch (error: unknown) {
      const msg = (error as Error)?.message;
      setIsLoading(false);
      toast.error(
        (messages?.error ?? "Unable to initialize Google sign in: ") + (msg ?? ""),
      );
      return;
    }

    setIsLoading(false);
  };

  return { signInWithGoogle, isLoading };
};
