import { string } from "zod";
import { TaskPriority, User } from ".";

// enum cho kiểu khóa của cột
export enum ColumnLockType {
  UNLOCKED = "UNLOCKED",
  FULLY_LOCKED = "FULLY_LOCKED",
  ONE_WAY_LOCKED = "ONE_WAY_LOCKED",
}

// Interface cho Task (đang là mảng rỗng trong JSON của bạn)
export interface Task {
  columnId: string; // Thêm thuộc tính columnId để biết task thuộc cột nào
  id: string;
  title: string;
  priority: TaskPriority; // Thêm thuộc tính priority
  description?: string;
  position: number;
  labels: Label[];
  dueDate?: string; // Ngày hết hạn (nếu có)
  assignee: User | null;
  // Thêm các thuộc tính khác của task nếu có (ví dụ: dueDate, labels, assignee...)
}
export interface createTask extends Omit<Task, "assignee" | "id" | "labels"> {
  assigneeId?: string; // Dùng dấu ? để cho phép string | undefined
  labelIds?: string[]; // Dùng dấu ? để cho phép string[] | undefined
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

// Interface cho Column
export interface Column {
  id: string;
  title: string;
  lock_type: ColumnLockType;
  position: number;
  tasks: Task[];
}

export interface CreateColumn extends Omit<Column, "id" | "tasks"> {
  boardId?: string;
}
// Nếu bạn muốn dùng trực tiếp kiểu dữ liệu mảng các cột
export type ColumnList = Column[];
