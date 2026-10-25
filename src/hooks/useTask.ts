import { MoveTaskDto, taskService } from "@/services/task.service";
import { Column, createTask, Task } from "@/types/column";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./useSocket";
import { TaskPriority } from "@/types";

export const useCreateTask = (boardId: string) => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  return useMutation({
    mutationFn: (data: createTask) => taskService.createTask(data),
    onSuccess: (newTask: Task) => {
      console.log("newTask:", newTask);

      // 1. Refetch lại dữ liệu Board hiện tại
      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });

      // 2. Tự động invalidate lại danh sách Activity Logs của board này
      // Giúp component hiển thị lịch sử tự động cập nhật ngay dòng log "CREATED_TASK" vừa phát sinh
      queryClient.invalidateQueries({
        queryKey: ["activity-logs", { boardId }],
      });

      // 3. Phát socket realtime nếu có
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

export const useDeleteTask = (boardId: string) => {
  const queryClient = useQueryClient();
  // const socket = useSocket();
  return useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: (newTask: Task) => {
      // Tự động refetch lại API Workspace Detail để cập nhật danh sách Board mới
      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });
      // if (socket && boardId) {
      //   socket.emit("create-task", {
      //     boardId,
      //     columnId: newTask.columnId,
      //     newTask: newTask,
      //   });
      // }
    },
  });
};

export const useUpdateAssignTask = (boardId: string) => {
  const queryClient = useQueryClient();
  // const socket = useSocket();
  return useMutation({
    mutationFn: ({
      taskId,
      userIds,
      leaderId,
    }: {
      taskId: string;
      userIds: string[];
      leaderId: string | null;
    }) => taskService.updateAssign(taskId, userIds, leaderId),
    onSuccess: (newTask: Task) => {
      // Tự động refetch lại API Workspace Detail để cập nhật danh sách Board mới
      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });
      // if (socket && boardId) {
      //   socket.emit("create-task", {
      //     boardId,
      //     columnId: newTask.columnId,
      //     newTask: newTask,
      //   });
      // }
    },
  });
};

export const useUpdateTaskPriority = (boardId: string) => {
  const queryClient = useQueryClient();
  // const socket = useSocket();
  return useMutation({
    mutationFn: ({ taskId, priority }: { taskId: string; priority: TaskPriority }) =>
      taskService.updateTaskPriority(taskId, priority),
    onSuccess: (newTask: Task) => {
      // Tự động refetch lại API Workspace Detail để cập nhật danh sách Board mới
      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });
      // if (socket && boardId) {
      //   socket.emit("create-task", {
      //     boardId,
      //     columnId: newTask.columnId,
      //     newTask: newTask,
      //   });
      // }
    },
  });
};

export const useUpdateTaskDates = (boardId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      startDate,
      dueDate,
    }: {
      taskId: string;
      startDate?: string | null;
      dueDate?: string | null;
    }) => taskService.updateTaskDates(taskId, { startDate, dueDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });
    },
  });
};
