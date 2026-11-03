import { getAuthClient } from "@/lib/auth/auth-client";
import axiosInstance from "@/lib/axios";
import { UserRole } from "@/types";

import {
  AuthResponse,
  ForgotPasswordDto,
  ForgotPasswordResponse,
  ResetPasswordDto,
  ResetPasswordResponse,
  SignInDto,
  SignUpDto,
  User,
} from "@/types/api.types";

function mapAuthUser(u: {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  gender: string | null;
  birthday: Date | null;
  phone: string | null;
  isOnline: boolean;
  role?: UserRole;
  createdAt: Date;
  updatedAt: Date;
}): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    gender: u.gender ?? undefined,
    birthday: u.birthday instanceof Date ? u.birthday.toISOString() : String(u.birthday),
    image: u.image ?? undefined,
    role: u.role || UserRole.CUSTOMER,
    emailVerified: u.emailVerified,
    isOnline: u.isOnline, //
    createdAt:
      u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
    updatedAt:
      u.updatedAt instanceof Date ? u.updatedAt.toISOString() : String(u.updatedAt),
  };
}

async function readSessionToken(): Promise<string> {
  const s = await getAuthClient().getSession();
  return s.data?.session?.token ?? "";
}

export const authService = {
  signUp: async (data: SignUpDto): Promise<AuthResponse> => {
    const res = await getAuthClient().signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
    });

    if (res.error) {
      throw Object.assign(new Error(res.error.message || "Đăng ký thất bại"), {
        response: { data: { message: res.error.message } },
      });
    }

    const raw = res.data?.user;

    if (!raw) {
      throw Object.assign(new Error("Đăng ký thất bại"), {
        response: {
          data: {
            message: "Không lấy được thông tin user",
          },
        },
      });
    }

    const user = mapAuthUser({
      ...raw,
      isOnline: true, // Bổ sung trường bắt buộc còn thiếu
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    const token = await readSessionToken();

    return {
      success: true,
      user,
      token,
    };
  },

  resendVerificationEmail: async (email: string): Promise<void> => {
    const res = await getAuthClient().sendVerificationEmail({ email });

    if (res.error) {
      const msg = res.error.message || "Gửi email xác thực thất bại";
      throw Object.assign(new Error(msg), {
        response: { data: { message: msg } },
      });
    }
  },
  signOut: async (): Promise<void> => {
    const res = await getAuthClient().signOut();

    if (res.error) {
      const msg = res.error.message || "Đăng xuất thất bại";
      throw Object.assign(new Error(msg), {
        response: { data: { message: msg } },
      });
    }
  },

  signIn: async (data: SignInDto & { rememberMe?: boolean }): Promise<AuthResponse> => {
    const res = await getAuthClient().signIn.email({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    });

    if (res.error) {
      throw Object.assign(new Error(res.error.message || "Đăng nhập thất bại"), {
        response: { data: { message: res.error.message } },
      });
    }

    const raw = res.data?.user;

    if (!raw) {
      throw Object.assign(new Error("Đăng nhập thất bại"), {
        response: { data: { message: "Không lấy được thông tin user" } },
      });
    }

    const user = mapAuthUser({
      ...raw,
      isOnline: true, // Bổ sung trường bắt buộc còn thiếu
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    if (user.emailVerified === false) {
      throw Object.assign(
        new Error(
          "Vui lòng xác thực email trước khi đăng nhập. Kiểm tra hộp thư của bạn.",
        ),
        {
          response: {
            data: {
              message:
                "Vui lòng xác thực email trước khi đăng nhập. Kiểm tra hộp thư của bạn.",
            },
          },
        },
      );
    }

    const token = await readSessionToken();

    return { success: true, user, token };
  },

  forgotPassword: async (data: ForgotPasswordDto): Promise<ForgotPasswordResponse> => {
    const res = await getAuthClient().requestPasswordReset({
      email: data.email,
      redirectTo: `/auth/reset-password`,
    });

    if (res.error) {
      const msg = res.error.message || "Gửi email thất bại";
      throw Object.assign(new Error(msg), {
        response: { data: { message: msg } },
      });
    }

    return { success: true, message: "Đã gửi email đặt lại mật khẩu" };
  },

  resetPassword: async (data: ResetPasswordDto): Promise<ResetPasswordResponse> => {
    const res = await getAuthClient().resetPassword({
      token: data.token,
      newPassword: data.newPassword,
    });

    if (res.error) {
      throw Object.assign(new Error(res.error.message || "Đặt lại mật khẩu thất bại"), {
        response: { data: { message: res.error.message } },
      });
    }

    return { success: true };
  },

  signInWithGoogle: async (redirectPath?: string): Promise<void> => {
    if (typeof window === "undefined") return;

    const redirect =
      redirectPath !== undefined && redirectPath !== "" ? redirectPath : "/";

    const encoded = encodeURIComponent(
      redirect.startsWith("/") ? redirect : `/${redirect}`,
    );
    const callbackURL = `/auth/callback/google?redirect=${encoded}`;

    const res = await getAuthClient().signIn.social({
      provider: "google",
      callbackURL,
    });

    if (res.error) {
      throw new Error(res.error.message || "Khởi tạo đăng nhập Google thất bại");
    }

    if (res.data?.url) {
      window.location.href = res.data.url;
    }
  },
  getMe: async (): Promise<User> => {
    try {
      const response = await axiosInstance.get("api/v1/auth/me");

      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi get me(Server):", error?.response?.data || error.message);
      throw error;
    }
  },

  updateProfile: async (id: string, formData: FormData) => {
    try {
      const { data } = await axiosInstance.patch(`/api/v1/auth`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("sdfasdfsd", data);
      return data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(
        "Lỗi updateProfile (Server):",
        error?.response?.data || error.message,
      );
      throw error;
    }
  },
};
