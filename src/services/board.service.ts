import axiosInstance from "@/lib/axios";
import { CreateBoardDto, BoardResponse } from "@/types/board";

export const boardService = {
  createBoard: async (dto: CreateBoardDto): Promise<BoardResponse> => {
    try {
      const response = await axiosInstance.post<BoardResponse>(`/api/v1/boards`, dto);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi createBoard (Server):", error?.response?.data || error.message);
      throw error;
    }
  },
};
