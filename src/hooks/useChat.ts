import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatService, ChatScope, CreateMessageDto } from "@/services/chat.service";

// Hook Query lấy danh sách tin nhắn theo Scope và Target ID
export const useGetMessages = (scope: ChatScope, targetId: string) => {
  return useQuery({
    queryKey: ["messages", scope, targetId], // Query key duy nhất theo từng scope và targetId
    queryFn: () => chatService.getMessages({ scope, targetId }),
    enabled: !!targetId && !!scope, // Chỉ gọi API khi có đủ scope và targetId
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
