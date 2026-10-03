import axiosInstance from "@/lib/axios";
import { ColumnLockType } from "@/types";
import { Column, CreateColumn } from "@/types/column";
export interface UpdateColumnClockPayload {
  columnId: string;
  lock: ColumnLockType; // Hoặc clock tùy theo biến tên bạn muốn đặt
}
export const columnService = {
  createColumn: async (dto: CreateColumn): Promise<Column> => {
    try {
      const response = await axiosInstance.post<Column>(`/api/v1/columns`, dto);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi createColumn (Server):", error?.response?.data || error.message);
      throw error;
    }
  },
  updateColumnClock: async (data: UpdateColumnClockPayload): Promise<Column> => {
    try {
      const response = await axiosInstance.patch<Column>(
        `/api/v1/columns/${data.columnId}`,
        {
          lock_type: data.lock,
        },
      );
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(
        "Lỗi updateColumnClock (Server):",
        error?.response?.data || error.message,
      );
      throw error;
    }
  },
};
