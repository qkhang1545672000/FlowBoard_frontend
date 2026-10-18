import axiosInstance from "@/lib/axios";
import { TaskPriority } from "@/types";
import { createTask, Task } from "@/types/column";
export interface MoveTaskDto {
  columnId: string;
  position: number;
}
export const taskService = {
  createTask: async (dto: createTask): Promise<Task> => {
    try {
      const response = await axiosInstance.post<Task>(`/api/v1/tasks`, dto);
      console.log("task tạo trong service:", response.data);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi createTask (Server):", error?.response?.data || error.message);
      throw error;
    }
  },
  moveTask: async (id: string, dto: MoveTaskDto): Promise<Task> => {
    try {
      const response = await axiosInstance.patch<Task>(`/api/v1/tasks/${id}/move`, dto);
      console.log("updataPrr", response.data);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi moveTask (Server):", error?.response?.data || error.message);
      throw error;
    }
  },
  deleteTask: async (taskId: string): Promise<Task> => {
    try {
      const response = await axiosInstance.delete<Task>(`/api/v1/tasks/${taskId}`);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi deleteTask (Server):", error?.response?.data || error.message);
      throw error;
    }
  },
  updateTaskPriority: async (taskId: string, Priority: TaskPriority): Promise<Task> => {
    try {
      const response = await axiosInstance.patch<Task>(`/api/v1/tasks/${taskId}`, {
        priority: Priority,
      });

      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi updateAssign (Server):", error?.response?.data || error.message);
      throw error;
    }
  },

  updateTaskDueDate: async (taskId: string, dueDate: string): Promise<Task> => {
    try {
      const response = await axiosInstance.patch<Task>(`/api/v1/tasks/${taskId}`, {
        dueDate,
      });

      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(
        "Lỗi updateTaskDueDate (Server):",
        error?.response?.data || error.message,
      );
      throw error;
    }
  },

  updateAssign: async (
    taskId: string,
    userIds: string[],
    leaderId?: string | null,
  ): Promise<Task> => {
    try {
      const response = await axiosInstance.patch<Task>(`/api/v1/tasks/${taskId}/assign`, {
        userIds,
        leaderId,
      });

      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi updateAssign (Server):", error?.response?.data || error.message);
      throw error;
    }
  },
};
