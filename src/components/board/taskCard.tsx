"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/column";
import { Clock, Lock, MoreVertical, Edit3, Trash2, AlertTriangle } from "lucide-react";
import { TaskPriority } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import UserAvatar from "../ui/UserAvatar";
import { useBoardPermission } from "./useBoardPermission";
import { useBoardStore } from "@/store/useBoardStore";
import { LockedUser } from "@/hooks/useBoardSocket";
import { TaskDetailModal } from "./TaskDetailModal"; // Import Modal
import { useDeleteTask } from "@/hooks/useTask";

interface Props {
  task: Task;
  isOverlay?: boolean;
  lockedBy?: LockedUser;
  onDeleteTask?: (taskId: string) => void;
}

export function TaskCard({ task, isOverlay, lockedBy, onDeleteTask }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false); // State điều khiển Modal chi tiết
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State menu 3 chấm
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); // State modal xác nhận xóa

  const menuRef = useRef<HTMLDivElement>(null);

  const boardId = useBoardStore((state) => state.activeBoardId) ?? "";
  const { isOwn } = useBoardPermission(boardId);
  const user = useAuthStore((state) => state.user);
  const { mutate: deleteTask } = useDeleteTask(boardId);
  const isLockedByOther = Boolean(lockedBy && lockedBy.id !== user?.id);
  const isAssignee = task.assignee?.id === user?.id || user?.role === "ADMIN" || isOwn;
  const canDrag = isAssignee && !isLockedByOther;

  // Lắng nghe sự kiện bấm ra bên ngoài để tự động đóng Submenu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

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

        {/* Nút 3 chấm & Submenu */}
        <div ref={menuRef} className="absolute top-2.5 right-2.5 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute right-0 mt-1 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1 z-30 text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 flex items-center gap-2">
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Cập nhật</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  setIsDeleteConfirmOpen(true);
                }}
                className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa task</span>
              </button>
            </div>
          )}
        </div>

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex gap-1.5 flex-wrap pr-6">
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
        <h4 className="text-sm font-medium text-slate-100 line-clamp-2 pr-6">
          {task.title}
        </h4>

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

      {/* Render Modal Chi tiết Task */}
      <TaskDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={task}
      />

      {/* Render Modal Xác nhận xóa toàn màn hình dùng React Portal */}
      {isDeleteConfirmOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-100">Xác nhận xóa</h3>
                <p className="text-sm text-slate-400">Bạn thực sự muốn xóa task này?</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors">
                  Hủy
                </button>
                <button
                  onClick={() => {
                    deleteTask(task.id);
                    setIsDeleteConfirmOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-red-600/20">
                  Xóa ngay
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
