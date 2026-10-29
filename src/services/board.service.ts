import axiosInstance from "@/lib/axios";
import { CreateBoardDto, Board, BoardDetail, UpdateBoardDto } from "@/types/board";

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

  deteleBoard: async (boardId: string): Promise<Board> => {
    try {
      const response = await axiosInstance.delete<Board>(`/api/v1/boards/${boardId}`);
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
      console.log("ffffff", response.data);
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

  updateBoard: async ({
    id,
    dto,
  }: {
    id: string;
    dto: UpdateBoardDto;
  }): Promise<Board> => {
    try {
      const response = await axiosInstance.patch<Board>(`/api/v1/boards/${id}`, dto);
      console.log("ressss", response.data);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi updateBoard (Server):", error?.response?.data || error.message);
      throw error;
    }
  },
};
