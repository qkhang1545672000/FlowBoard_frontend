export enum UserRole {
  CUSTOMER = "CUSTOMER",
  ADMIN = "ADMIN",
}

export enum WorkspaceRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum BoardVisibility {
  PRIVATE = "PRIVATE",
  WORKSPACE = "WORKSPACE",
  PUBLIC = "PUBLIC",
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

export interface Board {
  id: string;
  title: string;
  tasksCount?: number;
  membersCount?: number;
  updatedAt?: string;
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
