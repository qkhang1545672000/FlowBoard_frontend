import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService, ChatScope, CreateMessageDto } from "@/services/chat.service";

// Hook Query lấy danh sách tin nhắn theo Scope và Target ID
export const useGetMessages = (scope: ChatScope, targetId: string) => {
  return useInfiniteQuery({
    queryKey: ["messages", scope, targetId],
    queryFn: ({ pageParam }) =>
      chatService.getMessages({
        scope,
        targetId,
        cursor: pageParam,
        limit: 20,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!targetId && !!scope,
  });
};

// Hook Mutation Gửi tin nhắn mới (hỗ trợ gửi kèm file/ảnh)
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMessageDto) => chatService.sendMessage(data),
    onSuccess: (newMessage) => {
      const targetId = newMessage.taskId || newMessage.boardId || newMessage.workspaceId;

      if (targetId) {
        queryClient.invalidateQueries({
          queryKey: ["messages", newMessage.scope, targetId],
        });
      }
    },
  });
};
