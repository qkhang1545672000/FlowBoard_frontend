import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { chatService, ChatScope, CreateMessageDto } from "@/services/chat.service";

// Hook Query lấy danh sách tin nhắn theo Scope và Target ID
export const useGetMessages = (scope: ChatScope, targetId: string) => {
  return useInfiniteQuery({
    queryKey: ["messages", scope, targetId],
    queryFn: ({ pageParam }) =>
      chatService.getMessages({
        scope,
        targetId,
        cursor: pageParam, // pageParam đóng vai trò là cursor (nextCursor từ lần gọi trước)
        limit: 20,
      }),
    initialPageParam: undefined as string | undefined, // Khởi tạo trang đầu tiên không có cursor
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined, // Lấy nextCursor từ response của backend để làm cursor cho lần fetch tiếp theo
    enabled: !!targetId && !!scope, // Chỉ gọi khi có đủ scope và targetId
  });
};

// Hook Mutation Gửi tin nhắn mới
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMessageDto) => chatService.sendMessage(data),
    onSuccess: (newMessage) => {
      // Xác định targetId tương ứng dựa theo scope của tin nhắn vừa gửi thành công
      const targetId = newMessage.taskId || newMessage.boardId || newMessage.workspaceId;

      if (targetId) {
        // Invalidate và tự động fetch lại danh sách tin nhắn cho room tương ứng
        queryClient.invalidateQueries({
          queryKey: ["messages", newMessage.scope, targetId],
        });
      }
    },
  });
};
