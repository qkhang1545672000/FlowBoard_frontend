import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardService } from "@/services/board.service";

import { BoardDetail, CreateBoardDto, UpdateBoardDto } from "@/types/board";
import { toast } from "sonner";
import { useBoardStore } from "@/store/useBoardStore";

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
        typeof message === "string"
          ? message
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((error as any)?.error ?? "Đã có lỗi xảy ra"),
      );
    },
  });
};

export const useBoardDetail = (board_id?: string, options?: { enabled?: boolean }) => {
  const boardId = useBoardStore((state) => state.activeBoardId) ?? "";
  let select_boardId = boardId;
  if (board_id) {
    select_boardId = board_id;
  }

  // Kết hợp điều kiện có ID VÀ điều kiện enabled từ bên ngoài truyền vào (nếu có)
  const isEnabled =
    options?.enabled !== undefined
      ? options.enabled && !!select_boardId
      : !!select_boardId;

  return useQuery<BoardDetail>({
    queryKey: ["board", select_boardId],
    queryFn: () => boardService.getBoardDetailByBoardId(select_boardId),
    enabled: isEnabled,
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof message === "string"
          ? message
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((error as any)?.error ?? "Đã có lỗi xảy ra"),
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
