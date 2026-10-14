// Frontend: app/invitations/accept/page.tsx (Next.js)
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAcceptMemberW } from "@/hooks/useWorkSpace";

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("Đang kiểm tra thông tin lời mời...");
  const setWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);
  const { mutateAsync: acceptMember, isPending: isDeleteAPI } = useAcceptMemberW();
  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessage("Mã lời mời không hợp lệ.");
      return;
    }

    // 1. Lưu token vào localStorage để dùng sau khi Đăng ký/Đăng nhập xong
    localStorage.setItem("pending_invite_token", token);

    // 2. Thử gọi API chấp nhận lời mời (với Session/Token hiện tại nếu có)
    acceptMember(token);
  }, [token, router, queryClient]);

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h2>{message}</h2>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "50px", textAlign: "center" }}>
          <h2>Đang tải...</h2>
        </div>
      }>
      <AcceptInvitationContent />
    </Suspense>
  );
}
