import { authService } from "@/services/auth.services";
import { workSpaceService } from "@/services/workspace.service";
import { useAuthStore } from "@/store/useAuthStore";
import { User } from "@/types";

import {
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from "@/types/api.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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

  return useMutation({
    mutationFn: (data: SignInDto & { rememberMe?: boolean }) => authService.signIn(data),

    onSuccess: async (response) => {
      // 1. Cập nhật TanStack Query Cache
      queryClient.setQueriesData(
        { queryKey: ["auth", "session"] },
        {
          user: response.user,
          isGuest: false,
          isAuthenticated: true,
        },
      );
      const pendingToken = await localStorage.getItem("pending_invite_token");
      console.log("fasfdsf", response);
      // 2. Cập nhật dữ liệu vào Zustand Store
      setUser(response.user as User);
      await queryClient.prefetchQuery({
        queryKey: ["workspace"],
        queryFn: () => workSpaceService.getWorkSpace(),
      });

      toast.success(messages?.success ?? "Sign in successful");

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
  const clearAuthUser = useAuthStore((state) => state.clearAuth); // Hoặc hàm clear state trong auth store của bạn

  return useMutation({
    mutationFn: () => authService.signOut(),

    onSuccess: async () => {
      // 1. Xóa hoặc reset TanStack Query Cache liên quan đến session và dữ liệu user
      queryClient.setQueryData(["auth", "session"], null);
      queryClient.clear(); // Xóa toàn bộ cache nếu muốn dọn sạch dữ liệu cũ khi đăng xuất

      // 2. Clear state người dùng trong Zustand Store
      if (clearAuthUser) {
        clearAuthUser();
      }

      // 3. Dọn dẹp các storage riêng biệt (như board storage hoặc workspace storage nếu có)
      localStorage.removeItem("active-board-storage");
      // localStorage.removeItem("active-workspace-storage");

      toast.success(messages?.success ?? "Signed out successfully");

      // 4. Chuyển hướng về trang đăng nhập hoặc trang chỉ định
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
