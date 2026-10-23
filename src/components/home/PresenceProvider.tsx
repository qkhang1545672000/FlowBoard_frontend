/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSocket } from "@/hooks/useSocket";
import { useAuthSocket } from "@/hooks/useAuthSocket";
import { useAuthStore } from "@/store/useAuthStore";

export function PresenceProvider() {
  const userCurrent = useAuthStore((state) => state.user);
  const userId = userCurrent?.id;

  // Khởi tạo socket và kích hoạt presence online toàn cục
  const socket = useSocket("/auth");
  useAuthSocket({ socket, userId });

  return null; // Component ngầm, không render ra HTML gì trên màn hình
}
