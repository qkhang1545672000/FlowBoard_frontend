import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { ChatScope, ChatMessage, CreateMessageDto } from "@/services/chat.service";
import { useAuthStore } from "@/store/useAuthStore"; // 🟢 Import auth store để lấy current user id

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

  // 🟢 Lấy id của user đang đăng nhập từ Zustand Store
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!targetId || !scope || !currentUser?.id) return;

    // 1. Kết nối tới namespace /chat và truyền kèm userId vào query handshake
    const socket = io(`${SOCKET_URL}/chat`, {
      transports: ["websocket"],
      withCredentials: true,
      query: {
        userId: currentUser.id, // 🟢 Bắt buộc để backend đưa client vào phòng cá nhân user_{userId}
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[ChatSocket] Connected:", socket.id);

      // Tham gia room chat (với DIRECT, backend sẽ dựa vào socket join cá nhân hoặc bạn có thể emit join-chat)
      socket.emit("join-chat", { scope, targetId });
    });

    // 2. Lắng nghe tin nhắn mới phát ra từ Gateway
    socket.on("new-message", (newMessage: ChatMessage) => {
      // 🟢 Kiểm tra xem tin nhắn này có thực sự thuộc về khung chat hiện tại không
      // - Nếu là WORKSPACE/BOARD/TASK: kiểm tra workspaceId/boardId/taskId khớp targetId không.
      // - Nếu là DIRECT: kiểm tra tin nhắn phải liên quan giữa currentUser.id và targetId (recipientId hoặc senderId).
      const isRelevant =
        scope === ChatScope.DIRECT
          ? (newMessage.sender.id === currentUser.id &&
              newMessage.recipientId === targetId) ||
            (newMessage.sender.id === targetId &&
              newMessage.recipientId === currentUser.id)
          : newMessage.workspaceId === targetId ||
            newMessage.boardId === targetId ||
            newMessage.taskId === targetId;

      if (!isRelevant) return;

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

        // Kiểm tra an toàn chống trùng lặp tin nhắn
        const allItems = oldData.pages.flatMap((page) => page.items || []);
        const isDuplicated = allItems.some((msg) => msg?.id === newMessage.id);

        if (isDuplicated) {
          return oldData;
        }

        // Thêm tin nhắn mới vào trang cuối cùng
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
  }, [scope, targetId, currentUser?.id, queryClient, queryKey]);

  // Hàm hỗ trợ phát sự kiện 'send-message' trực tiếp qua Socket
  const emitSendMessage = (senderId: string, dto: CreateMessageDto) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("send-message", { senderId, dto });
    }
  };

  return { emitSendMessage };
};
