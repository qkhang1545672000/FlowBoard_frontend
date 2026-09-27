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
  role: UserRole;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
}

export interface Board {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  background?: string;
  visibility: BoardVisibility;
  activeTasksCount?: number;
  membersCount?: number;
  updatedAt: string;
}
