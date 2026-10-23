/* eslint-disable react-hooks/refs */
// hooks/useSocket.ts
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

/**
 * Hook dùng chung để kết nối socket
 * @param namespace - Ví dụ: "/auth" hoặc "/chat" hoặc để trống nếu dùng root
 */
export const useSocket = (namespace?: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Nếu có truyền namespace (ví dụ: "/auth"), nối vào URL thành "http://localhost:3000/auth"
    const url = namespace ? `${SOCKET_URL}${namespace}` : SOCKET_URL;

    socketRef.current = io(url, {
      transports: ["websocket"],
      autoConnect: true,
      withCredentials: true,
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [namespace]);

  return socketRef.current;
};
