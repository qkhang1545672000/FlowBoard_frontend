import axiosInstance from "@/lib/axios";
import { CreateWorkspaceDto } from "@/types/apiWorkspace.type";
import { WorkspaceDetailResponse, WorkspaceResponse } from "@/types/workSpace";
export interface PaginatedWorkspaceResponse {
  data: WorkspaceResponse[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}
export const workSpaceService = {
  //Lấy danh sách workspace mà người dùng hiện có
  getWorkSpace: async (
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedWorkspaceResponse> => {
    try {
      const response = await axiosInstance.get<PaginatedWorkspaceResponse>(
        "/api/v1/workspaces/",
        {
          params: { page, limit },
        },
      );

      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi getWorkSpace:", error?.response?.data || error.message);
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
  //Xóa workspace
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
  inviteMemberWorkspace: async (
    workspaceId: string,
    email: string,
    role: string = "MEMBER",
  ): Promise<void> => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/workspaces/${workspaceId}/invitations`,
        {
          email, // Hoặc email: email
          role, // Hoặc role: role
        },
      );

      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(
        "Lỗi inviteMemberWorkspace (Server):",
        error?.response?.data || error.message,
      );
      throw error;
    }
  },
};
