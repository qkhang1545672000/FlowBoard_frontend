import axiosInstance from "@/lib/axios";
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
  updateAssign: async (taskId: string, userId: string): Promise<Task> => {
    try {
      const response = await axiosInstance.patch<Task>(`/api/v1/tasks/${taskId}`, {
        assigneeId: userId,
      });
      console.log("sfsadsdfxxxx", response.data);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi updateAssign (Server):", error?.response?.data || error.message);
      throw error;
    }
  },
};
