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
  content: string;
  attachments?: ChatAttachment[];
}

export interface QueryMessageParams {
  scope: ChatScope;
  targetId: string;
  page?: number;
  limit?: number;
}

export interface PaginatedMessagesResponse {
  items: ChatMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const chatService = {
  // POST /api/v1/chats - Gửi tin nhắn mới (Workspace, Board hoặc Task)
  sendMessage: async (dto: CreateMessageDto): Promise<ChatMessage> => {
    try {
      const response = await axiosInstance.post<ChatMessage>("/api/v1/chats", dto);
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
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi getMessages (Server):", error?.response?.data || error.message);
      throw error;
    }
  },
};
