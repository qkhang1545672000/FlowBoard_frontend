import axiosInstance from "@/lib/axios";

export interface ActivityLogUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface ActivityLogItem {
  id: string;
  createdAt: string;
  user: ActivityLogUser;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any> | null;
}

export interface QueryActivityLogParams {
  boardId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedActivityLogsResponse {
  items: ActivityLogItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const activityLogService = {
  // GET /api/v1/activity-logs - Lấy danh sách lịch sử hoạt động
  getActivityLogs: async (
    params: QueryActivityLogParams,
  ): Promise<PaginatedActivityLogsResponse> => {
    try {
      const response = await axiosInstance.get<PaginatedActivityLogsResponse>(
        "/api/v1/activity-logs",
        { params },
      );
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(
        "Lỗi getActivityLogs (Server):",
        error?.response?.data || error.message,
      );
      throw error;
    }
  },
};
