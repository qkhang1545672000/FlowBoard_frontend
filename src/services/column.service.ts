import axiosInstance from "@/lib/axios";
import { Column, CreateColumn } from "@/types/column";

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
};
