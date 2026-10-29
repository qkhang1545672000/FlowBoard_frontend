/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/column";
import { Clock, Lock, MoreVertical, Edit3, Trash2 } from "lucide-react";
import { TaskPriority } from "@/types";
import { useBoardPermission } from "../useBoardPermission";
import { useBoardStore } from "@/store/useBoardStore";
import { LockedUser } from "@/hooks/useBoardSocket";
import { TaskDetailModal } from "./TaskDetailModal";
import { AssignTaskModal } from "./AssignTaskModal";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTask";
import { useSafeUser } from "@/hooks/useSafeUser";
import GroupChatAvatar from "../../ui/GroupChatAvatar";
import { useTaskPermission } from "./useTaskPermission";
import { TaskPriorityDropdown } from "./TaskPriorityDropdown";
import { TaskDateRangePopover } from "./TaskDateRangePopover";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useWorkspacePermission } from "../../workspace/useWorkspacePermission";
import { formatDateRangeDisplay } from "@/lib/took";
import { DeleteConfirmModal } from "../../ui/DeleteConfirmModal";

interface Props {
  task: Task;
  isOverlay?: boolean;
  lockedBy?: LockedUser;
  onDeleteTask?: (taskId: string) => void;
  onUpdatePriority?: (taskId: string, priority: TaskPriority) => void;
  onUpdateDueDate?: (taskId: string, date: string) => void;
}
const priorityColorMap = {
  [TaskPriority.URGENT]: "bg-red-500 shadow-sm shadow-red-500/50",
  [TaskPriority.HIGH]: "bg-orange-500 shadow-sm shadow-orange-500/50",
  [TaskPriority.MEDIUM]: "bg-amber-500 shadow-sm shadow-amber-500/50",
  [TaskPriority.LOW]: "bg-slate-600",
};

export function TaskCard({ task, isOverlay, lockedBy, onUpdatePriority }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Cập nhật lại state khi task thay đổi từ props

  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const boardId = useBoardStore((state) => state.activeBoardId) ?? "";
  const workspapceId = useWorkspaceStore((state) => state.activeWorkspaceId) ?? "";
  const { isOwn } = useBoardPermission(boardId);
  const { isOwn: isOwnWorkspace } = useWorkspacePermission(workspapceId);
  const user = useSafeUser();
  const { isTaskLeader } = useTaskPermission(boardId, task.id);
  const { mutate: deleteTask } = useDeleteTask(boardId);
  const { mutate: updateTaskDates } = useUpdateTask(boardId);
  const isLockedByOther = Boolean(lockedBy && lockedBy.id !== user?.id);
  const isAssignee = isTaskLeader || user?.role === "ADMIN" || isOwn || isOwnWorkspace;
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

  useEffect(() => {
    if (!isPriorityOpen) {
      if (cardRef.current) {
        if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
        leaveTimeoutRef.current = setTimeout(() => {
          setIsHovered(false);
        }, 150);
      }
    }
  }, [isPriorityOpen]);

  useEffect(() => {
    return () => {
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: {
        type: "TASK",
        task,
      },
      disabled: !canDrag,
    });

  const combinedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    cardRef.current = node;
  };

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  // 🟢 Nếu hoàn thành thì ép tiến độ thành 100%, ngược lại lấy giá trị gốc của task
  const progressValue = task.isCompleted ? 100 : Math.round(task.progress ?? 0);

  const isExpanded =
    isHovered ||
    isMenuOpen ||
    isModalOpen ||
    isAssignModalOpen ||
    isDatePopoverOpen ||
    isPriorityOpen;

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }

    if (!enterTimeoutRef.current && !isHovered) {
      enterTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
        enterTimeoutRef.current = null;
      }, 200);
    }
  };

  const handleMouseLeave = () => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }

    leaveTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      leaveTimeoutRef.current = null;
    }, 200);
  };

  return (
    <>
      <div
        ref={combinedRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setIsModalOpen(true)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 p-3 rounded-xl shadow-md transition-all space-y-2 ${
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

        {/* ─── 1. MẶC ĐỊNH (RÚT GỌN) ─── */}
        {!isExpanded && (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className={`w-6 h-2 rounded-sm shrink-0 ${priorityColorMap[task.priority] || "bg-slate-600"}`}
                  title={`Priority: ${task.priority}`}
                />
                {/* 🟢 Dùng truncate kết hợp min-w-0 để tự động ... khi dài quá */}
                <h4 className="text-xs font-medium text-slate-100 truncate line-clamp-5 max-w-[100px]">
                  {task.title}
                </h4>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  ({task.timeRemaining})
                </div>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAssignModalOpen(true);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                title="Giao nhiệm vụ"
                className="cursor-pointer transition-transform hover:scale-105 shrink-0">
                {task.members.length > 0 ? (
                  <GroupChatAvatar participants={memberTask} type="chat" maxVisible={3} />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[10px] shadow-md">
                    K
                  </div>
                )}
              </div>
            </div>

            <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  task.isCompleted
                    ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                    : progressValue >= 70
                      ? "bg-red-600 shadow-sm shadow-red-500/50"
                      : progressValue >= 50
                        ? "bg-amber-500"
                        : progressValue >= 30
                          ? "bg-amber-500"
                          : "bg-sky-500"
                }`}
                style={{ width: `${Math.max(progressValue, 4)}%` }}
              />
            </div>
          </>
        )}

        {/* ─── 2. KHI MỞ RỘNG ─── */}
        {isExpanded && (
          <div className="space-y-2">
            <div ref={menuRef} className="absolute top-2 right-2 z-20">
              <button
                type="button"
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
                  className="absolute right-0 mt-1 w-32 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1 z-30 text-xs max-h-48 overflow-y-auto">
                  <button
                    type="button"
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
                    type="button"
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

            <h4 className="text-xs font-medium text-slate-100 line-clamp-2 pr-6">
              {task.title}
            </h4>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Tiến độ ({task.timeRemaining})</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-300">{progressValue}%</span>

                  <div
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="flex items-center">
                    <TaskDateRangePopover
                      startDate={task.startDate}
                      dueDate={task.dueDate}
                      isOpen={isDatePopoverOpen}
                      onOpenChange={setIsDatePopoverOpen}
                      onUpdateDates={(newStart, newDue) => {
                        updateTaskDates({
                          taskId: task.id,
                          startDate: newStart,
                          dueDate: newDue,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    task.isCompleted
                      ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                      : progressValue >= 70
                        ? "bg-red-600 shadow-sm shadow-red-500/50"
                        : progressValue >= 50
                          ? "bg-amber-500"
                          : progressValue >= 30
                            ? "bg-amber-500"
                            : "bg-sky-500"
                  }`}
                  style={{ width: `${Math.max(progressValue, 4)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-700/40">
              <div className="flex items-center gap-2 relative">
                <TaskPriorityDropdown
                  priority={task.priority}
                  taskId={task.id}
                  isOpen={isPriorityOpen}
                  onOpenChange={setIsPriorityOpen}
                  onUpdatePriority={(newPriority) => {
                    if (onUpdatePriority) {
                      onUpdatePriority(task.id, newPriority);
                    }
                  }}
                />

                {task.dueDate && task.startDate && (
                  <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {formatDateRangeDisplay(task.startDate, task.dueDate)}
                  </span>
                )}
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAssignModalOpen(true);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
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
        )}
      </div>

      <TaskDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={task}
      />

      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        task={task}
        onAssign={(userId) => {
          console.log("Assigned user ID:", userId);
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          deleteTask(task.id);
        }}
        title="Xác nhận xóa"
        message="Bạn thực sự muốn xóa task này?"
      />
    </>
  );
}
