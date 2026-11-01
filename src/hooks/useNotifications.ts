// src/hooks/useNotifications.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { workSpaceService } from "@/services/workspace.service";
import { useAuthStore } from "@/store/useAuthStore";
import { NotificationItem } from "@/components/Notification/Notification";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

// 1. Hook Query lấy danh sách thông báo
export const useNotifications = () => {
  const user = useAuthStore((state) => state.user);
  const knownNotificationIds = useRef<Set<string>>(new Set());
  const isInitialMount = useRef(true);

  // Khởi tạo mutation markAsRead để dùng khi bấm nút X trên toast
  const { mutate: markAsRead } = useMarkAsRead();

  const query = useQuery<NotificationItem[]>({
    queryKey: ["notifications"],
    queryFn: notificationService.getNotifications,
    enabled: !!user?.id,
    refetchInterval: 10000, // Polling mỗi 10 giây
  });

  const { data: notifications = [] } = query;

  useEffect(() => {
    if (notifications.length === 0) return;

    // Lọc ra các thông báo chưa đọc
    const unreadList = notifications.filter((n) => n.unread);

    if (isInitialMount.current) {
      // 🚀 LẦN ĐẦU VÀO TRANG / F5: Hiện tối đa 3 thông báo chưa đọc gần nhất
      unreadList.slice(0, 3).forEach((n, index) => {
        setTimeout(() => {
          toast.success(n.title, {
            description: "Bạn có thông báo chưa đọc",
            duration: Infinity, // Giữ toast không tự mất nếu muốn người dùng chủ động bấm
            closeButton: true, // Hiển thị nút X

            // 🎯 Khi người dùng bấm nút X (onDismiss), tự động gọi hàm markAsRead đã viết ở trên
            onDismiss: () => {
              markAsRead(n.id);
            },
          });
        }, index * 400);
      });

      notifications.forEach((n) => knownNotificationIds.current.add(n.id));
      isInitialMount.current = false;
      return;
    }

    // ⚡ CÁC LẦN POLLING SAU (Real-time khi đang mở web)
    notifications.forEach((n) => {
      if (!knownNotificationIds.current.has(n.id)) {
        knownNotificationIds.current.add(n.id);

        if (n.unread) {
          toast.success(n.title, {
            description: "Bạn có hoạt động mới trong Workspace",
            duration: Infinity,
            closeButton: true,
            onDismiss: () => {
              markAsRead(n.id);
            },
          });
        }
      }
    });
  }, [notifications, markAsRead]);

  return query;
};

// 2. Hook Mutation đánh dấu đã đọc 1 thông báo
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: unknown) => {
      const message = (
        error as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message;

      toast.error(
        typeof message === "string"
          ? message
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((error as any)?.error ?? "Không thể đánh dấu đã đọc"),
      );
    },
  });
};

// 3. Hook Mutation đánh dấu tất cả thông báo là đã đọc
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: unknown) => {
      const message = (
        error as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message;

      toast.error(
        typeof message === "string"
          ? message
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((error as any)?.error ?? "Không thể đánh dấu tất cả là đã đọc"),
      );
    },
  });
};

// 4. Hook Mutation chấp nhận lời mời Workspace qua token
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => workSpaceService.acceptMemberWorkspace(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["workspace"] }); // Cập nhật lại danh sách workspace
      toast.success("Gia nhập Workspace thành công!");
    },
    onError: (error: unknown) => {
      const message = (
        error as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message;

      toast.error(
        typeof message === "string"
          ? message
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((error as any)?.error ?? "Có lỗi xảy ra khi chấp nhận lời mời"),
      );
    },
  });
};
