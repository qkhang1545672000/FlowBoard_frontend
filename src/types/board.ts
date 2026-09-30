export interface CreateBoardDto {
  title: string;
  description?: string;
  workspaceId: string;
  memberIds?: string[];
  leaderId?: string | null;
}

export interface BoardResponse {
  id: string;
  title: string;
  description?: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  // Thêm các thuộc tính khác do Backend trả về nếu có
}
