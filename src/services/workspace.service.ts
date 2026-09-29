import axiosInstance from "@/lib/axios";
import { CreateWorkspaceDto } from "@/types/apiWorkspace.type";
import { WorkspaceDetailRespone, WorkspaceResponse } from "@/types/workSpace";

export const workSpaceService = {
  //Lấy danh sách workspace mà người dùng hiện có
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
  //Xem chi tiết của workspace
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
  //Tạo workspace

  createWorkspace: async (w: CreateWorkspaceDto): Promise<void> => {
    try {
      // Gửi trực tiếp object `w` vào request body
      const response = await axiosInstance.post(`/api/v1/workspaces`, w);

      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(
        "Lỗi createWorkspace (Server):",
        error?.response?.data || error.message,
      );
      throw error;
    }
  },

  deleteWorkspace: async (workspaceId: string): Promise<WorkspaceDetailRespone> => {
    try {
      // Lấy toàn bộ headers/cookies từ Request gửi đến Next.js Server

      const response = await axiosInstance.delete(`/api/v1/workspaces/${workspaceId}`);

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
