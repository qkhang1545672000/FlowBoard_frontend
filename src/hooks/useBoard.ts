import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardService } from "@/services/board.service";

import { BoardDetail, CreateBoardDto, UpdateBoardDto } from "@/types/board";
import { toast } from "sonner";

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
    onError: (error: unknown) => {
      const message = (
        error as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message;

      toast.error(
        typeof message === "string" ? message : (message?.error ?? "Sign in failed"),
      );
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

export const useDeleteBoard = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) => boardService.deteleBoard(boardId),
    onSuccess: (_, variables) => {
      // Tự động refetch lại API Workspace Detail để cập nhật danh sách Board mới
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId],
      });
    },
    onError: (error: unknown) => {
      const message = (
        error as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message;

      toast.error(
        typeof message === "string" ? message : (message?.error ?? "Sign in failed"),
      );
    },
  });
};

export const useUpdateBoard = (workspaceId: string, boardId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBoardDto }) =>
      boardService.updateBoard({ id, dto }),
    onSuccess: () => {
      // Tự động refetch lại API Workspace hoặc danh sách Board để cập nhật giao diện mới nhất
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });
      toast.success("Cập nhật board thành công!");
    },
    onError: (error: unknown) => {
      const message = (
        error as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message;

      toast.error(typeof message === "string" ? message : "Cập nhật board thất bại");
    },
  });
};
