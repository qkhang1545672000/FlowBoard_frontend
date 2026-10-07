import { MoveTaskDto, taskService } from "@/services/task.service";
import { createTask, Task } from "@/types/column";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./useSocket";

export const useCreateTask = (boardId: string) => {
  const queryClient = useQueryClient();
  const socket = useSocket();
  return useMutation({
    mutationFn: (data: createTask) => taskService.createTask(data),
    onSuccess: (newTask: Task) => {
      // Tự động refetch lại API Workspace Detail để cập nhật danh sách Board mới
      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });
      if (socket && boardId) {
        socket.emit("create-task", {
          boardId,
          columnId: newTask.columnId,
          newTask: newTask,
        });
      }
    },
  });
};

export const useMoveTask = (boardId: string) => {
  const queryClient = useQueryClient();
  const socket = useSocket();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: MoveTaskDto }) =>
      taskService.moveTask(id, dto),
    onSuccess: () => {
      // Refresh dữ liệu board sau khi di chuyển thành công
      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });
      if (socket && boardId) {
        socket.emit("typeLock-column", {
          boardId,
          columnId: newColumn.id,
          typeLock: newColumn.lock_type,
        });
      }
    },
  });
};
