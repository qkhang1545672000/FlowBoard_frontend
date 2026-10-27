/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

interface UseAuthSocketProps {
  socket: Socket | null;
  userId?: string;
}

export const useAuthSocket = ({ socket, userId }: UseAuthSocketProps) => {
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | undefined>(undefined);

  // 1. Quản lý trạng thái Online / Logout tự động dựa vào sự thay đổi của userId
  useEffect(() => {
    if (!socket) return;

    // TH1: User ĐÃ ĐĂNG NHẬP (có userId)
    if (userId) {
      const handleConnect = () => {
        socket.emit("user-online", userId);
      };

      if (socket.connected) {
        socket.emit("user-online", userId);
      }

      socket.on("connect", handleConnect);
      prevUserIdRef.current = userId; // Lưu lại ID hiện tại

      return () => {
        socket.off("connect", handleConnect);
      };
    }
    // TH2: User VỪA ĐĂNG XUẤT (userId chuyển từ có -> undefined/null)
    else if (!userId && prevUserIdRef.current) {
      console.log(
        "[AuthSocket] User logged out, emitting user-offline for:",
        prevUserIdRef.current,
      );
      socket.emit("user-offline", prevUserIdRef.current);
      prevUserIdRef.current = undefined; // Reset lại
    }
  }, [socket, userId]);

  // 2. Lắng nghe sự kiện thay đổi trạng thái từ server để cập nhật UI realtime cho tất cả mọi người
  useEffect(() => {
    if (!socket) return;

    const handleStatusChanged = (data: { userId: string; isOnline: boolean }) => {
      queryClient.setQueriesData({ queryKey: ["workspace"] }, (oldData: any) => {
        if (!oldData) return oldData;

        if (Array.isArray(oldData)) {
          return oldData.map((ws) => ({
            ...ws,
            members: ws.members?.map((member: any) =>
              member.user?.id === data.userId
                ? { ...member, user: { ...member.user, isOnline: data.isOnline } }
                : member,
            ),
          }));
        }

        if (oldData.members) {
          return {
            ...oldData,
            members: oldData.members.map((member: any) =>
              member.user?.id === data.userId
                ? { ...member, user: { ...member.user, isOnline: data.isOnline } }
                : member,
            ),
          };
        }

        return oldData;
      });
    };

    socket.on("user-status-changed", handleStatusChanged);

    return () => {
      socket.off("user-status-changed", handleStatusChanged);
    };
  }, [socket, queryClient]);

  return { socket };
};
