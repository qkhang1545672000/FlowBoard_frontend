import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  subTaskService,
  CreateSubTaskDto,
  UpdateSubTaskDto,
} from "@/services/sub-task.service";

export const useSubTasks = (taskId: string) => {
  return useQuery({
    queryKey: ["subtasks", taskId],
    queryFn: () => subTaskService.findAllByTask(taskId),
    enabled: !!taskId,
  });
};

export const useCreateSubTask = (taskId: string, boardId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSubTaskDto) => subTaskService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", taskId] });
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      }
    },
  });
};

export const useUpdateSubTask = (taskId: string, boardId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSubTaskDto }) =>
      subTaskService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", taskId] });
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      }
    },
  });
};

export const useDeleteSubTask = (taskId: string, boardId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subTaskService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", taskId] });
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      }
    },
  });
};
