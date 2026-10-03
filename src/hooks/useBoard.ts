import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardService } from "@/services/board.service";

import { BoardDetail, CreateBoardDto } from "@/types/board";

// Hook Mutation Tạo Board mới
export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBoardDto) => boardService.createBoard(data),
    onSuccess: (_, variables) => {
      // Tự động refetch lại API Workspace Detail để cập nhật danh sách Board mới
      queryClient.invalidateQueries({
        queryKey: ["workspace"],
      });
    },
  });
};

export const useBoardDetail = (boardId: string) => {
  return useQuery<BoardDetail>({
    queryKey: ["board", boardId], // Query key bao gồm boardId để tự động refetch khi ID thay đổi
    queryFn: () => boardService.getBoardDetailByBoardId(boardId),
    enabled: !!boardId, // Chỉ chạy query khi boardId có giá trị (tránh gọi API khi ID bị undefined/null)
  });
};
