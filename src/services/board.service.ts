import axiosInstance from "@/lib/axios";
import { CreateBoardDto, Board, BoardDetail } from "@/types/board";

export const boardService = {
  createBoard: async (dto: CreateBoardDto): Promise<Board> => {
    try {
      const response = await axiosInstance.post<Board>(`/api/v1/boards`, dto);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi createBoard (Server):", error?.response?.data || error.message);
      throw error;
    }
  },
  // lấy chi tiết của board theo boardId
  getBoardDetailByBoardId: async (boardId: string): Promise<BoardDetail> => {
    try {
      const response = await axiosInstance.get<BoardDetail>(`/api/v1/boards/${boardId}`);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(
        "Lỗi getBoardDetailByBoardId (Server):",
        error?.response?.data || error.message,
      );
      throw error;
    }
  },
};
