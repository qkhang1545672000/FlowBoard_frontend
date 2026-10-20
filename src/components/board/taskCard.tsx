"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/column";
import { Clock, Lock, MoreVertical, Edit3, Trash2, AlertTriangle } from "lucide-react";
import { TaskPriority } from "@/types";
import { useBoardPermission } from "./useBoardPermission";
import { useBoardStore } from "@/store/useBoardStore";
import { LockedUser } from "@/hooks/useBoardSocket";
import { TaskDetailModal } from "./TaskDetailModal";
import { AssignTaskModal } from "./AssignTaskModal";
import { useDeleteTask, useUpdateTaskDueDate } from "@/hooks/useTask";
import { useSafeUser } from "@/hooks/useSafeUser";
import GroupChatAvatar from "../ui/GroupChatAvatar";
import { useTaskPermission } from "./useTaskPermission";
import { TaskPriorityDropdown } from "./TaskPriorityDropdown";
import { TaskDueDatePopover } from "./datePicker";

interface Props {
  task: Task;
  isOverlay?: boolean;
  lockedBy?: LockedUser;
  onDeleteTask?: (taskId: string) => void;
  onUpdatePriority?: (taskId: string, priority: TaskPriority) => void;
  onUpdateDueDate?: (taskId: string, date: string) => void;
}

export function TaskCard({
  task,
  isOverlay,
  lockedBy,
  onDeleteTask,
  onUpdatePriority,
  onUpdateDueDate,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const boardId = useBoardStore((state) => state.activeBoardId) ?? "";
  const { isOwn } = useBoardPermission(boardId);
  const user = useSafeUser();
  const { isTaskLeader } = useTaskPermission(boardId, task.id);
  const { mutate: deleteTask } = useDeleteTask(boardId);
  const { mutate: upTaskDueDate } = useUpdateTaskDueDate(boardId);
  const isLockedByOther = Boolean(lockedBy && lockedBy.id !== user?.id);
  const isAssignee = isTaskLeader || user?.role === "ADMIN" || isOwn;
  const canDrag = isAssignee && !isLockedByOther;

  const memberTask = task.members.map((t) => t.user);

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

  const progressValue = Math.round(task.progress ?? 0);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setIsModalOpen(true)}
        className={`group relative bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 p-3 rounded-xl shadow-md transition-all space-y-2 ${
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
        <div ref={menuRef} className="absolute top-2 right-2 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 rounded-lg transition-colors">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {isMenuOpen && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute right-0 mt-1 w-32 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1 z-30 text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-slate-800 flex items-center gap-2">
                <Edit3 className="w-3 h-3 text-indigo-400" />
                <span>Cập nhật</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  setIsDeleteConfirmOpen(true);
                }}
                className="w-full text-left px-3 py-1.5 text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                <Trash2 className="w-3 h-3" />
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
                className="h-1.5 w-6 rounded-full block"
                style={{ backgroundColor: label.color || "#8b5cf6" }}
                title={label.name}
              />
            ))}
          </div>
        )}

        {/* Title */}
        <h4 className="text-xs font-medium text-slate-100 line-clamp-2 pr-6">
          {task.title}
        </h4>

        {/* Thanh tiến độ */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>Tiến độ ({task.timeRemaining})</span>
            <div className="flex items-center gap-1.5">
              <span>{progressValue}%</span>

              {/* Nút chọn lịch luôn hiển thị ổn định */}
              <div
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="flex items-center">
                <TaskDueDatePopover
                  dueDate={task.dueDate}
                  onUpdateDueDate={(newIsoDate) => {
                    upTaskDueDate({ taskId: task.id, dueDate: newIsoDate });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Thanh tiến độ thay đổi màu theo mốc phần trăm */}
          <div className="w-full bg-slate-700/50 h-1 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progressValue >= 70
                  ? "bg-red-600 shadow-sm shadow-red-500/50"
                  : progressValue >= 50
                    ? "bg-amber-500"
                    : progressValue >= 30
                      ? "bg-emerald-500"
                      : "bg-sky-500"
              }`}
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-700/40">
          <div className="flex items-center gap-2 relative">
            <TaskPriorityDropdown
              priority={task.priority}
              taskId={task.id}
              onUpdatePriority={(newPriority) => {
                if (onUpdatePriority) {
                  onUpdatePriority(task.id, newPriority);
                }
              }}
            />

            {task.dueDate && (
              <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                <Clock className="w-3 h-3 text-amber-400" />
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>

          {/* Biểu tượng tròn Assignee */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsAssignModalOpen(true);
            }}
            title="Giao nhiệm vụ"
            className="cursor-pointer transition-transform hover:scale-105">
            {task.members.length > 0 ? (
              <GroupChatAvatar participants={memberTask} type="chat" maxVisible={3} />
            ) : (
              <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[10px] shadow-md">
                K
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={task}
      />

      {/* Assign Task Modal */}
      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        task={task}
        onAssign={(userId) => {
          console.log("Assigned user ID:", userId);
        }}
      />

      {/* Render Modal Xác nhận xóa */}
      {isDeleteConfirmOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-100">Xác nhận xóa</h3>
                <p className="text-xs text-slate-400">Bạn thực sự muốn xóa task này?</p>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors">
                  Hủy
                </button>
                <button
                  onClick={() => {
                    deleteTask(task.id);
                    setIsDeleteConfirmOpen(false);
                  }}
                  className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-xl transition-colors shadow-lg shadow-red-600/20">
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
