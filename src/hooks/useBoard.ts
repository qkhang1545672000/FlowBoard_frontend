import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardService } from "@/services/board.service";

import { CreateBoardDto } from "@/types/board";

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
