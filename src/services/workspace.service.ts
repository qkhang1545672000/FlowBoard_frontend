import axiosInstance from "@/lib/axios";
import { WorkspaceRole } from "@/types";
import { CreateWorkspaceDto } from "@/types/apiWorkspace.type";
import { WorkspaceDetailResponse, WorkspaceResponse } from "@/types/workSpace";
export interface PaginatedWorkspaceResponse {
  data: WorkspaceResponse[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}
export type WorkspaceFilterType = "all" | "owned" | "joined";
export const workSpaceService = {
  //Lấy danh sách workspace mà người dùng hiện có
  getWorkSpace: async (
    page: number = 1,
    limit: number = 10,
    type: WorkspaceFilterType = "all",
  ): Promise<PaginatedWorkspaceResponse> => {
    try {
      const response = await axiosInstance.get<PaginatedWorkspaceResponse>(
        "/api/v1/workspaces/",
        {
          params: { page, limit, type },
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
  getWorkspaceDetail: async (workspaceId: string): Promise<WorkspaceDetailResponse> => {
    try {
      // Lấy toàn bộ headers/cookies từ Request gửi đến Next.js Server

      const response = await axiosInstance.get<WorkspaceDetailResponse>(
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
  deleteWorkspace: async (workspaceId: string): Promise<WorkspaceDetailResponse> => {
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
    role: WorkspaceRole.MEMBER_WORKSPACE,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  acceptMemberWorkspace: async (token: string): Promise<any> => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/workspaces/invitations/accept?token=${token}`,
      );

      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(
        "Lỗi acceptMemberWorkspace (Server):",
        error?.response?.data || error.message,
      );
      throw error;
    }
  },
  updateRoleForWorspaceMember: async (
    workspaceId: string,
    userId: string,
    role: string | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await axiosInstance.patch<any>(
        `/api/v1/workspaces/${workspaceId}/members/${userId}`,
        {
          role,
        },
      );

      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(
        "Lỗi  updateRoleForWorspaceMember (Server):",
        error?.response?.data || error.message,
      );
      throw error;
    }
  },

  deleteMemberWorkspace: async (
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceDetailResponse> => {
    try {
      // Lấy toàn bộ headers/cookies từ Request gửi đến Next.js Server

      const response = await axiosInstance.delete(
        `/api/v1/workspaces/${workspaceId}/members/${userId}`,
      );

      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(
        "Lỗi  deleteMemberWorkspace (Server):",
        error?.response?.data || error.message,
      );
      throw error;
    }
  },
};
