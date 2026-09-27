// Frontend: app/invitations/accept/page.tsx (Next.js)
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [message, setMessage] = useState("Đang kiểm tra thông tin lời mời...");

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessage("Mã lời mời không hợp lệ.");
      return;
    }

    // 1. Lưu token vào localStorage để dùng sau khi Đăng ký/Đăng nhập xong
    localStorage.setItem("pending_invite_token", token);

    // 2. Thử gọi API chấp nhận lời mời (với Session/Token hiện tại nếu có)
    fetch(`http://localhost:8080/api/v1/workspaces/invitations/accept?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Nếu dùng Cookie/Session
    })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          // Chưa đăng nhập -> Chuyển sang trang Đăng ký (hoặc Đăng nhập)
          setMessage("Bạn cần đăng ký/đăng nhập để gia nhập Workspace.");
          setTimeout(() => {
            router.push(`/auth/signin?redirect=/invitations/accept?token=${token}`);
          }, 1500);
          return;
        }

        const data = await res.json();
        if (res.ok && data.success) {
          // Đã đăng nhập và gia nhập thành công -> Xóa token tạm và chuyển vào Workspace
          localStorage.removeItem("pending_invite_token");
          setMessage("Tham gia Workspace thành công! Đang chuyển hướng...");
          setTimeout(() => router.push(`/workspaces/${data.workspaceId}`), 1500);
        } else {
          setMessage(data.message || "Lời mời không hợp lệ hoặc đã hết hạn.");
        }
      })
      .catch(() => setMessage("Lỗi kết nối máy chủ."));
  }, [token, router]);

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h2>{message}</h2>
    </div>
  );
}
