import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { ChatScope, ChatMessage, CreateMessageDto } from "@/services/chat.service";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

export const useChatSocket = (scope: ChatScope, targetId: string) => {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const queryKey = ["messages", scope, targetId];

  useEffect(() => {
    if (!targetId || !scope) return;

    // 1. Kết nối tới namespace /chat
    const socket = io(`${SOCKET_URL}/chat`, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[ChatSocket] Connected:", socket.id);
      // Tham gia room chat
      socket.emit("join-chat", { scope, targetId });
    });

    // 2. Lắng nghe tin nhắn mới phát ra từ Gateway
    socket.on("new-message", (newMessage: ChatMessage) => {
      queryClient.setQueryData(
        queryKey,
        (
          oldData:
            | { items: ChatMessage[]; total: number; page: number; limit: number }
            | undefined,
        ) => {
          if (!oldData) {
            return {
              items: [newMessage],
              total: 1,
              page: 1,
              limit: 20,
            };
          }

          // Tránh ghi trùng tin nhắn đã có trong danh sách
          if (oldData.items.some((msg) => msg.id === newMessage.id)) {
            return oldData;
          }

          return {
            ...oldData,
            items: [...oldData.items, newMessage],
            total: oldData.total + 1,
          };
        },
      );
    });

    // 3. Cleanup khi unmount hoặc đổi targetId/scope
    return () => {
      if (socket.connected) {
        socket.emit("leave-chat", { scope, targetId });
        socket.disconnect();
      }
    };
  }, [scope, targetId, queryClient]);

  // Hàm hỗ trợ phát sự kiện 'send-message' trực tiếp qua Socket
  const emitSendMessage = (senderId: string, dto: CreateMessageDto) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("send-message", { senderId, dto });
    }
  };

  return { emitSendMessage };
};
