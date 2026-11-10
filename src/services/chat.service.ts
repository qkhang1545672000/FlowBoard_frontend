import axiosInstance from "@/lib/axios";

export enum ChatScope {
  WORKSPACE = "WORKSPACE",
  BOARD = "BOARD",
  TASK = "TASK",
}

export interface ChatMessageSender {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface ChatAttachment {
  url: string;
  name?: string;
  type?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  attachments?: ChatAttachment[] | null;
  scope: ChatScope;
  workspaceId?: string | null;
  boardId?: string | null;
  taskId?: string | null;
  createdAt: string;
  sender: ChatMessageSender;
}

export interface CreateMessageDto {
  scope: ChatScope;
  workspaceId?: string;
  boardId?: string;
  taskId?: string;
  content?: string;
  attachments?: ChatAttachment[];
  files?: File[]; // 🟢 Hỗ trợ mảng file/ảnh
}

export interface QueryMessageParams {
  scope: ChatScope;
  targetId: string;
  cursor?: string;
  limit?: number;
}

export interface PaginatedMessagesResponse {
  items: ChatMessage[];
  nextCursor?: string | null;
  hasMore: boolean;
}

export const chatService = {
  // POST /api/v1/chats - Gửi tin nhắn mới (Tự động chuyển thành FormData nếu có file hoặc gửi JSON nếu không)
  sendMessage: async (dto: CreateMessageDto): Promise<ChatMessage> => {
    try {
      const formData = new FormData();
      formData.append("scope", String(dto.scope || "TASK"));

      // 🟢 Nếu không có nội dung chữ nhưng có file, gán chữ mặc định để thỏa mãn @IsNotEmpty() của backend
      const finalContent =
        dto.content?.trim() ||
        (dto.files && dto.files.length > 0 ? "[Tập tin đính kèm]" : "");
      formData.append("content", finalContent);

      if (dto.workspaceId) formData.append("workspaceId", dto.workspaceId);
      if (dto.boardId) formData.append("boardId", dto.boardId);
      if (dto.taskId) formData.append("taskId", dto.taskId);

      if (dto.files && dto.files.length > 0) {
        dto.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await axiosInstance.post<ChatMessage>("/api/v1/chats", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi sendMessage (Server):", error?.response?.data || error.message);
      throw error;
    }
  },

  // GET /api/v1/chats - Lấy danh sách tin nhắn theo Scope và Target ID
  getMessages: async (params: QueryMessageParams): Promise<PaginatedMessagesResponse> => {
    try {
      const response = await axiosInstance.get<PaginatedMessagesResponse>(
        "/api/v1/chats",
        { params },
      );
      console.log("ffffffSSS", response.data);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi getMessages (Server):", error?.response?.data || error.message);
      throw error;
    }
  },
};
