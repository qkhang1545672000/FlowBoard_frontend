"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/column";
import { Clock, Lock } from "lucide-react";
import { TaskPriority } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import UserAvatar from "../ui/UserAvatar";
import { useBoardPermission } from "./useBoardPermission";
import { useBoardStore } from "@/store/useBoardStore";
import { LockedUser } from "@/hooks/useBoardSocket";
import { TaskDetailModal } from "./TaskDetailModal"; // Import Modal

interface Props {
  task: Task;
  isOverlay?: boolean;
  lockedBy?: LockedUser;
}

export function TaskCard({ task, isOverlay, lockedBy }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false); // State điều khiển Modal

  const boardId = useBoardStore((state) => state.activeBoardId) ?? "";
  const { isOwn } = useBoardPermission(boardId);
  const user = useAuthStore((state) => state.user);

  const isLockedByOther = Boolean(lockedBy && lockedBy.id !== user?.id);
  const isAssignee = task.assignee?.id === user?.id || user?.role === "ADMIN" || isOwn;
  const canDrag = isAssignee && !isLockedByOther;

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: {
        type: "TASK",
        task,
      },
      disabled: !canDrag,
    });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case TaskPriority.HIGH:
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case TaskPriority.MEDIUM:
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case TaskPriority.LOW:
      default:
        return "bg-slate-700/50 text-slate-300 border-slate-600/30";
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setIsModalOpen(true)} // Mở modal khi bấm vào thẻ
        className={`relative bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 p-3.5 rounded-xl shadow-md transition-all space-y-3 ${
          canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-not-allowed"
        } ${isDragging ? "opacity-30 border-dashed border-indigo-500" : ""} ${
          isOverlay ? "ring-2 ring-indigo-500 shadow-2xl scale-105 bg-slate-800" : ""
        } ${
          isLockedByOther
            ? "opacity-60 border-amber-500/50 bg-slate-800/50 select-none"
            : ""
        }`}>
        {/* Lock indicator */}
        {isLockedByOther && (
          <div className="absolute -top-2.5 -right-2 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 z-20 animate-pulse">
            <Lock className="w-3 h-3" />
            <span>{lockedBy?.displayName || "Đang bị giữ"}</span>
          </div>
        )}

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {task.labels.map((label) => (
              <span
                key={label.id}
                className="h-2 w-8 rounded-full block"
                style={{ backgroundColor: label.color || "#8b5cf6" }}
                title={label.name}
              />
            ))}
          </div>
        )}

        {/* Title */}
        <h4 className="text-sm font-medium text-slate-100 line-clamp-2">{task.title}</h4>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getPriorityColor(
                task.priority,
              )}`}>
              {task.priority}
            </span>

            {task.dueDate && (
              <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                <Clock className="w-3 h-3 text-amber-400" />
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>

          {task.assignee && (
            <UserAvatar
              name={task.assignee.name}
              type="chat"
              fallbackClassName={`${
                task.assignee.id === user?.id ? "bg-red-600" : "bg-yellow-400"
              }`}
            />
          )}
        </div>
      </div>

      {/* Render Modal */}
      <TaskDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={task}
      />
    </>
  );
}
