import { create } from "zustand";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

interface ChatSocketState {
  socket: Socket | null;
  unreadWorkspaceIds: Set<string>;

  // Actions
  connectSocket: (userId: string) => void;
  disconnectSocket: () => void;
  resetUnreadChat: (workspaceId?: string, currentTargetId?: string) => void;
  addUnreadWorkspace: (workspaceId: string) => void;
}

export const useChatSocketStore = create<ChatSocketState>((set, get) => ({
  socket: null,
  unreadWorkspaceIds: new Set(),

  connectSocket: (userId: string) => {
    console.log("222222222222222", userId);
    if (!userId) {
      console.log("⚠️ Chưa có userId, bỏ qua kết nối socket.");
      return;
    }
    const existingSocket = get().socket;
    if (existingSocket) {
      existingSocket.disconnect();
    }

    const socket = io(`${SOCKET_URL}/chat`, {
      transports: ["websocket"],
      withCredentials: true,
      query: { userId },
      forceNew: true,
    });

    set({ socket });

    socket.on("connect", () => {
      console.log("[GlobalChatSocket] Connected:", socket.id);
    });

    // Lắng nghe thông báo ngầm toàn cục từ server
    socket.on(
      "new-workspace-chat-notification",
      (data: { workspaceId: string; senderId: string }) => {
        console.log("🔥 Nhận thông báo ngầm toàn cục:", data);

        if (data.senderId === userId) return;

        if (!data.workspaceId) return;

        // Chuẩn hóa ID về dạng string chuẩn, loại bỏ khoảng trắng thừa
        const cleanWorkspaceId = String(data.workspaceId).trim();

        // Thêm workspaceId vào danh sách chưa đọc
        set((state) => {
          const newSet = new Set(state.unreadWorkspaceIds);
          newSet.add(cleanWorkspaceId);
          console.log(
            "✅ Đã cập nhật unreadWorkspaceIds trong Store:",
            Array.from(newSet),
          );
          return { unreadWorkspaceIds: newSet };
        });
      },
    );
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  resetUnreadChat: (workspaceId?: string, currentTargetId?: string) => {
    set((state) => {
      const newSet = new Set(state.unreadWorkspaceIds);
      if (workspaceId) {
        newSet.delete(String(workspaceId).trim());
      } else if (currentTargetId) {
        newSet.delete(String(currentTargetId).trim());
      }
      console.log("🧹 Đã reset unread của workspace, còn lại:", Array.from(newSet));
      return { unreadWorkspaceIds: newSet };
    });
  },

  addUnreadWorkspace: (workspaceId: string) => {
    if (!workspaceId) return;
    const cleanId = String(workspaceId).trim();
    set((state) => {
      const newSet = new Set(state.unreadWorkspaceIds);
      newSet.add(cleanId);
      return { unreadWorkspaceIds: newSet };
    });
  },
}));
