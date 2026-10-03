import { Participant, WorkspaceRole } from ".";
import { User } from "./api.types";
import { BoardOverview } from "./board";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
}

export interface WorkspaceResponse {
  id: string;
  name: string;
  slug: string;
  updatedAt: string;
  boardsCount: number;
  members: Participant[];
}
export interface Board {
  id: string;
  title: string;
  tasksCount: number;
  membersCount: number;
  updatedAt: string; // Hoặc kiểu Date nếu bạn parse chuỗi ISO string này về Date
}

// 2. Interface cho Workspace (chứa danh sách các boards)
export interface WorkspaceDetailResponse {
  id: string;
  name: string;
  description: string | null;
  members: WorkspaceMember[];
  boards: BoardOverview[];
}

export interface WorkspaceStore {
  // State
  activeWorkspaceId: string | null;
  activeWorkspaceSlug: string | null;

  // Actions
  setActiveWorkspace: (workspace: { id: string; slug: string }) => void;
  setActiveWorkspaceId: (id: string | null) => void;
  setActiveWorkspaceSlug: (slug: string | null) => void;
  clearActiveWorkspace: () => void;
}

export interface WorkspaceMember {
  id: string;
  role: WorkspaceRole; // Thêm các role có thể có
  joinedAt: string;
  user: User;
}
