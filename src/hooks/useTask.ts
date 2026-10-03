import { MoveTaskDto, taskService } from "@/services/task.service";
import { createTask, Task } from "@/types/column";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateTask = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: createTask) => taskService.createTask(data),
    onSuccess: () => {
      // Tự động refetch lại API Workspace Detail để cập nhật danh sách Board mới
      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });
    },
  });
};

export const useMoveTask = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: MoveTaskDto }) =>
      taskService.moveTask(id, dto),
    onSuccess: () => {
      // Refresh dữ liệu board sau khi di chuyển thành công
      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });
    },
  });
};
