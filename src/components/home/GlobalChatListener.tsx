"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatSocketStore } from "@/store/useChatSocketStore";
import { useSafeUser } from "@/hooks/useSafeUser";
import { User } from "@/types/api.types";

export function GlobalChatListener() {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const user = useSafeUser();
  const connectSocket = useChatSocketStore((state) => state.connectSocket);
  const disconnectSocket = useChatSocketStore((state) => state.disconnectSocket);

  useEffect(() => {
    if (!user) return;

    // Kích hoạt kết nối socket toàn cục thông qua Zustand Store
    connectSocket(user.id);

    return () => {
      disconnectSocket();
    };
  }, [user, connectSocket, disconnectSocket]);

  return null;
}
