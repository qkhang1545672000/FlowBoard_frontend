import axiosInstance from "@/lib/axios";
import { WorkspaceDetailRespone, WorkspaceResponse } from "@/types/workSpace";

export const workSpaceService = {
  getWorkSpace: async (): Promise<WorkspaceResponse[]> => {
    try {
      // Lấy toàn bộ headers/cookies từ Request gửi đến Next.js Server

      const response =
        await axiosInstance.get<WorkspaceResponse[]>("/api/v1/workspaces/");

      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi getMeServer (Server):", error?.response?.data || error.message);
      throw error;
    }
  },
  getWorkspaceDetail: async (workspaceId: string): Promise<WorkspaceDetailRespone> => {
    try {
      // Lấy toàn bộ headers/cookies từ Request gửi đến Next.js Server

      const response = await axiosInstance.get<WorkspaceDetailRespone>(
        `/api/v1/workspaces/${workspaceId}`,
      );

      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(
        "Lỗi getWorkspaceDetail (Server):",
        error?.response?.data || error.message,
      );
      throw error;
    }
  },
};
