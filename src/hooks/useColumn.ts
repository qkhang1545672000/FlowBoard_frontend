import { columnService, UpdateColumnClockPayload } from "@/services/column.service";

import { Column, CreateColumn } from "@/types/column";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./useSocket";

export const useCreateColumn = (boardId: string) => {
  const socket = useSocket();
  const queryClient = useQueryClient();
  // 2. Lấy instance socket

  return useMutation({
    mutationFn: (data: CreateColumn) => columnService.createColumn(data),
    onSuccess: (newColumn: Column) => {
      // API trả về object cột vừa tạo
      // A. Refetch cho máy người bấm
      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });

      // B. Phát Socket báo cho các máy khác đang ở cùng Bảng (Room)
      if (socket && boardId) {
        socket.emit("create-column", {
          boardId,
          newColumn,
        });
      }
    },
  });
};

export const useUpdateColumnClock = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateColumnClockPayload) => columnService.updateColumnClock(data),
    onSuccess: () => {
      // Tự động refetch lại API Workspace Detail để cập nhật danh sách Board mới
      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });
    },
  });
};

export const useDeleteColumn = (boardId: string) => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  return useMutation({
    mutationFn: (id: string) => columnService.deleteColumn(id),
    // onSuccess nhận 2 tham số: data (kết quả trả về) và variables (tham số 'id' truyền vào mutationFn)
    onSuccess: (_, deletedColumnId) => {
      // A. Refetch lại dữ liệu board cho máy người bấm xóa
      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });

      // B. Bắn Socket báo cho các máy khác trong cùng Board Room
      if (socket && boardId) {
        socket.emit("delete-column", {
          boardId,
          columnId: deletedColumnId,
        });
        console.log("sfsdfsdf");
      } else {
        console.error("Socket chưa sẵn sàng hoặc thiếu boardId!", { socket, boardId });
      }
    },
  });
};
