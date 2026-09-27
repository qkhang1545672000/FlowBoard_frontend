"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { useResendVerificationEmail } from "@/hooks/user-auth";
import { getAuthClient } from "@/lib/auth/auth-client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    token && email ? "idle" : "err",
  );

  const [message, setMessage] = useState(
    token && email ? "" : "Thiếu token hoặc email trong đường dẫn.",
  );

  const { mutate: resend, isPending: isResending } = useResendVerificationEmail({
    success: "Đã gửi email xác minh. Vui lòng kiểm tra hộp thư.",
    error: "Gửi email xác minh thất bại",
  });

  useEffect(() => {
    if (!token) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("loading");

    void getAuthClient()
      .verifyEmail({ query: { token } })
      .then(({ error }) => {
        if (error) {
          console.error("[auth] verifyEmail failed", error);
          setStatus("err");
          setMessage("Xác minh email thất bại.");
          return;
        }

        setStatus("ok");
        setMessage("Xác minh email thành công!");
      })
      .catch((err) => {
        console.error("[auth] verifyEmail request error", err);
        setStatus("err");
        setMessage("Không kết nối được máy chủ. Vui lòng thử lại.");
      });
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Xác minh email</h1>

      {status === "loading" && (
        <p className="text-muted-foreground">Đang xác minh...</p>
      )}

      {(status === "ok" || status === "err") && (
        <p className={status === "ok" ? "text-green-600" : "text-destructive"}>
          {message}
        </p>
      )}

      {status === "err" && email && (
        <Button
          disabled={isResending}
          onClick={() => resend(email)}
        >
          {isResending ? "Đang gửi..." : "Gửi lại email xác minh"}
        </Button>
      )}

      <Link
        href="/auth/signin"
        className={buttonVariants({ variant: "outline" })}
      >
        Quay lại đăng nhập
      </Link>
    </div>
  );
}
