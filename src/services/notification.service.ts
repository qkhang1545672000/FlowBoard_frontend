import { NotificationItem } from "@/components/Notification/Notification";
import axiosInstance from "@/lib/axios";

// Thêm vào file service hiện tại của bạn (ví dụ: workSpaceService)
export const notificationService = {
  // Lấy danh sách thông báo của user
  getNotifications: async (): Promise<NotificationItem[]> => {
    try {
      const response = await axiosInstance.get<NotificationItem[]>(
        "/api/v1/notifications",
      );

      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi getNotifications:", error?.response?.data || error.message);
      throw error;
    }
  },

  // Đánh dấu 1 thông báo là đã đọc
  markAsRead: async (id: string): Promise<void> => {
    try {
      await axiosInstance.patch(`/api/v1/notifications/${id}/read`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi markAsRead:", error?.response?.data || error.message);
      throw error;
    }
  },

  // Đánh dấu tất cả là đã đọc
  markAllAsRead: async (): Promise<void> => {
    try {
      await axiosInstance.patch(`/api/v1/notifications/read-all`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi markAllAsRead:", error?.response?.data || error.message);
      throw error;
    }
  },
};
