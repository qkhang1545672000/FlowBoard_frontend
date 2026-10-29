import axiosInstance from "@/lib/axios";
import { TaskMember } from "@/types/column";
import { User } from "better-auth";

export interface SubTask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  position: number;
  assignee: User | null;
  assigneeId?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  timeLeft: string | null;
}

export interface CreateSubTaskDto {
  taskId: string;
  title: string;
  completed?: boolean;
  assignee?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
}

export interface UpdateSubTaskDto {
  title?: string;
  completed?: boolean;
  assigneeId?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
}

export const subTaskService = {
  findAllByTask: async (taskId: string): Promise<SubTask[]> => {
    try {
      const response = await axiosInstance.get<SubTask[]>(`/api/v1/sub-tasks`, {
        params: { taskId },
      });
      console.log("rrrrrrr", response.data);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi findAllByTask:", error?.response?.data || error.message);
      throw error;
    }
  },

  create: async (dto: CreateSubTaskDto): Promise<SubTask> => {
    try {
      const response = await axiosInstance.post<SubTask>(`/api/v1/sub-tasks`, dto);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi tạo subTask:", error?.response?.data || error.message);
      throw error;
    }
  },

  update: async (id: string, dto: UpdateSubTaskDto): Promise<SubTask> => {
    try {
      const response = await axiosInstance.patch<SubTask>(`/api/v1/sub-tasks/${id}`, dto);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi cập nhật subTask:", error?.response?.data || error.message);
      throw error;
    }
  },

  remove: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.delete<{ message: string }>(
        `/api/v1/sub-tasks/${id}`,
      );
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi xóa subTask:", error?.response?.data || error.message);
      throw error;
    }
  },
};
