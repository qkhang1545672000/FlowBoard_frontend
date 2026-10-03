import { BoardMemberRole } from ".";
import { User } from "./api.types";
import { Column } from "./column";

export interface CreateBoardDto extends Pick<
  Board,
  "workspaceId" | "title" | "description" | "slug"
> {
  memberIds?: string[];
  leaderId?: string | null;
}
export interface Board {
  workspaceId: string;
  description?: string;
  slug: string;
  id: string;
  title: string;
  background: null;
  createdAt: string;
  updatedAt?: string;
}
export interface MemberBoard {
  boardId: string;
  createdAt: string;
  id: string;
  role: BoardMemberRole;
  updatedAt: string;
  user: User;
}
export interface BoardOverview extends Board {
  tasksCount?: number;
  membersCount?: number;
}

export interface BoardStore {
  // State
  activeBoardId: string | null;
  activeBoardSlug: string | null;

  // Actions
  setActiveBoard: (Board: { id: string; slug: string }) => void;
  setActiveBoardId: (id: string | null) => void;
  setActiveBoardSlug: (slug: string | null) => void;
  clearActiveBoard: () => void;
}
export interface BoardDetail extends Board {
  columns: Column[];
  members: MemberBoard[];
}
