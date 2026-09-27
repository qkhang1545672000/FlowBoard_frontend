"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSignIn } from "@/hooks/user-auth";
import { cn } from "@/lib/utils";
import { SignInDto } from "@/types/api.types";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useGoogleSignIn } from "@/hooks/user-auth";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";

export default function SignInForm({ className, ...props }: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get("redirect") ?? undefined;

  const signInMutation = useSignIn(
    {
      success: "Đăng nhập thành công!",
      error: "Đăng nhập thất bại",
    },
    redirectTo,
  );

  const { signInWithGoogle, isLoading: isGoogleLoading } = useGoogleSignIn({
    error: "Không thể khởi tạo đăng nhập Google",
  });

  type SignInFormValues = SignInDto & { rememberMe: boolean };

  const signInSchema = useMemo(
    () =>
      z.object({
        email: z.string().email("Email không hợp lệ"),
        password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
        rememberMe: z.boolean(),
      }),
    [],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // NÂNG CẤP HÀM ONSUBMIT XỬ LÝ LỜI MỜI PENDING
  const onSubmit = async (data: SignInFormValues) => {
    try {
      // 1. Đăng nhập
      await signInMutation.mutateAsync(data);

      // 2. Lấy token mời từ LocalStorage
      const pendingToken = localStorage.getItem("pending_invite_token");

      if (pendingToken) {
        const res = await fetch(
          `http://localhost:8080/api/v1/workspaces/invitations/accept?token=${pendingToken}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // Rất quan trọng để gửi kèm Cookie/Session vừa đăng nhập
          },
        );

        const result = await res.json();

        // Xóa token tạm sau khi xử lý xong (dù thành công hay thất bại)
        localStorage.removeItem("pending_invite_token");

        if (res.ok && result.workspaceId) {
          // Chuyển thẳng vào Workspace
          router.push(`/workspaces/${result.workspaceId}`);
          return;
        }
      }
    } catch (error) {
      console.error("Lỗi khi đăng nhập hoặc chấp nhận lời mời:", error);
    }
  };

  // Tạo đường dẫn Đăng ký duy trì Redirect Parameter
  const signUpLink = redirectTo
    ? `/auth/signup?redirect=${encodeURIComponent(redirectTo)}`
    : "/auth/signup";

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Chào mừng trở lại</h1>
                <p className="text-muted-foreground text-balance">
                  Đăng nhập vào tài khoản MtikTech
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                  disabled={signInMutation.isPending}
                />
                {errors.email && (
                  <FieldError className="text-destructive">
                    {errors.email.message}
                  </FieldError>
                )}
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                  <a
                    href="/auth/forgot-password"
                    className="ml-auto text-sm underline-offset-2">
                    Quên mật khẩu?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  disabled={signInMutation.isPending}
                />
                {errors.password && (
                  <FieldError className="text-destructive">
                    {errors.password.message}
                  </FieldError>
                )}
              </Field>

              <Field>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={watch("rememberMe")}
                    onCheckedChange={(v) => setValue("rememberMe", v === true)}
                    disabled={signInMutation.isPending}
                  />
                  Ghi nhớ đăng nhập
                </label>
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={signInMutation.isPending}>
                  {signInMutation.isPending ? "Đang đăng nhập" : "Đăng nhập"}
                </Button>
              </Field>

              <FieldSeparator>hoặc</FieldSeparator>
              <SocialAuthButtons
                onGoogleSignIn={signInWithGoogle}
                isGoogleLoading={isGoogleLoading}
              />

              <FieldDescription className="text-center">
                Chưa có tài khoản?{" "}
                <a href={signUpLink} className="font-medium text-primary hover:underline">
                  Đăng ký
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="bg-muted relative hidden md:block">
            <Image
              src="/login-thumbnail.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              fill
              priority
              sizes="(max-width: 768px) 0px, 50vw"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
