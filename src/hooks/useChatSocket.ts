import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { ChatScope, ChatMessage, CreateMessageDto } from "@/services/chat.service";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

interface InfiniteChatData {
  pages: {
    items: ChatMessage[];
    nextCursor: string | null;
    hasMore: boolean;
  }[];
  pageParams: (string | undefined)[];
}

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
      console.log("nnnnnewmanga", newMessage);

      queryClient.setQueryData(queryKey, (oldData: InfiniteChatData | undefined) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [
              {
                items: [newMessage],
                nextCursor: null,
                hasMore: false,
              },
            ],
            pageParams: [undefined],
          };
        }

        // Kiểm tra an toàn chống lỗi undefined (reading 'some') bằng ?. và || []
        const allItems = oldData.pages.flatMap((page) => page.items || []);
        const isDuplicated = allItems.some((msg) => msg?.id === newMessage.id);

        if (isDuplicated) {
          return oldData;
        }

        // Thêm tin nhắn mới vào trang cuối cùng (hoặc trang đầu tiên tùy thuộc vào cách bạn append)
        const newPages = [...oldData.pages];
        const lastPageIndex = newPages.length - 1;

        newPages[lastPageIndex] = {
          ...newPages[lastPageIndex],
          items: [...(newPages[lastPageIndex].items || []), newMessage],
        };

        return {
          ...oldData,
          pages: newPages,
        };
      });
    });

    // 3. Cleanup khi unmount hoặc đổi targetId/scope
    return () => {
      if (socket.connected) {
        socket.emit("leave-chat", { scope, targetId });
        socket.disconnect();
      }
    };
  }, [scope, targetId, queryClient, queryKey]);

  // Hàm hỗ trợ phát sự kiện 'send-message' trực tiếp qua Socket
  const emitSendMessage = (senderId: string, dto: CreateMessageDto) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("send-message", { senderId, dto });
    }
  };

  return { emitSendMessage };
};
