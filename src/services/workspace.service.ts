import axiosInstance from "@/lib/axios";
import { WorkspaceResponse } from "@/types/workSpace";

export const workSpaceService = {
  getWorkSpace: async (): Promise<WorkspaceResponse> => {
    try {
      // Lấy toàn bộ headers/cookies từ Request gửi đến Next.js Server

      const response = await axiosInstance.get<WorkspaceResponse>("/api/v1/workspaces/");

      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi getMeServer (Server):", error?.response?.data || error.message);
      throw error;
    }
  },
};
