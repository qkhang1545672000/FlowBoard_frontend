export enum UserRole {
  CUSTOMER = "CUSTOMER",
  ADMIN = "ADMIN",
}

export enum WorkspaceRole {
  OWNER = "OWNER",
  MEMBER_WORKSPACE = "MEMBER_WORKSPACE",
  LEADER_WORKSPACE = "LEADER_WORKSPACE",
}

export enum BoardVisibility {
  PRIVATE = "PRIVATE",
  WORKSPACE = "WORKSPACE",
  PUBLIC = "PUBLIC",
}
export enum BoardMemberRole {
  OWNER = "OWNER",
  BOARD_LEADER = "BOARD_LEADER",
  BOARD_MEMBER = "BOARD_MEMBER",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum ChatScope {
  WORKSPACE = "WORKSPACE",
  BOARD = "BOARD",
  TASK = "TASK",
}

export enum ColumnLockType {
  UNLOCKED = "UNLOCKED",
  FULLY_LOCKED = "FULLY_LOCKED",
  ONE_WAY_LOCKED = "ONE_WAY_LOCKED",
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: UserRole;
}

export interface Participant {
  _id: string;
  displayName: string;
  avatarUrl?: string | null;
  joinedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
}
