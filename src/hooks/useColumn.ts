import { columnService, UpdateColumnClockPayload } from "@/services/column.service";
import { ColumnLockType } from "@/types";

import { CreateColumn } from "@/types/column";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateColumn = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateColumn) => columnService.createColumn(data),
    onSuccess: () => {
      // Tự động refetch lại API Workspace Detail để cập nhật danh sách Board mới
      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });
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
