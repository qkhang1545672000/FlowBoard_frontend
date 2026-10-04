"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column, ColumnLockType } from "@/types/column";
import {
  Plus,
  MoreHorizontal,
  Lock,
  Unlock,
  Trash2,
  PlusCircle,
  ArrowDownLeft,
  Check,
} from "lucide-react";
import { TaskCard } from "./taskCard";
import { useCreateTask } from "@/hooks/useTask";
import { useBoardStore } from "@/store/useBoardStore";
import { useAuthStore } from "@/store/useAuthStore";
import { TaskPriority } from "@/types";
import {
  useCreateColumn,
  useDeleteColumn,
  useUpdateColumnClock,
} from "@/hooks/useColumn";

interface Props {
  column: Column;
  isOverlay?: boolean;
  onAddTask?: (columnId: string, title: string) => void;
  onAddColumnRight?: (targetColumnId: string, title: string) => void;
  onDeleteColumn?: (columnId: string) => void;
  onChangeLockType?: (columnId: string, newLockType: ColumnLockType) => void;
}

export function ColumnComponent({
  column,
  isOverlay,
  onAddTask,
  onAddColumnRight,
  onDeleteColumn,
}: Props) {
  const userCurrent = useAuthStore((state) => state.user);

  const boardId = useBoardStore((state) => state.activeBoardId) ?? "";
  const { mutate: createTask } = useCreateTask(boardId);
  const { mutate: updateColumnClock } = useUpdateColumnClock(boardId);
  const { mutate: deleteColumn } = useDeleteColumn(boardId);
  const { mutate: createColumn } = useCreateColumn(boardId);

  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const taskInputRef = useRef<HTMLTextAreaElement>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = tomorrow.toISOString();

  // State quản lý Menu More (3 chấm)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // State quản lý Sub Menu Khóa (Ổ khóa)
  const [isLockMenuOpen, setIsLockMenuOpen] = useState(false);
  const lockMenuRef = useRef<HTMLDivElement>(null);

  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const colInputRef = useRef<HTMLInputElement>(null);

  const tasksIds = useMemo(() => {
    return column.tasks ? column.tasks.map((task) => task.id) : [];
  }, [column.tasks]);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({
      id: column.id,
      data: {
        type: "COLUMN",
        column,
      },
    });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  useEffect(() => {
    if (isCreatingTask) {
      taskInputRef.current?.focus();
    }
  }, [isCreatingTask]);

  useEffect(() => {
    if (isCreatingColumn) {
      colInputRef.current?.focus();
    }
  }, [isCreatingColumn]);

  // Click outside cho cả 2 menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (lockMenuRef.current && !lockMenuRef.current.contains(event.target as Node)) {
        setIsLockMenuOpen(false);
      }
    };
    if (isMenuOpen || isLockMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, isLockMenuOpen]);

  // Chọn trạng thái khóa từ Sub Menu
  const handleSelectLockType = (lockType: ColumnLockType) => {
    setIsLockMenuOpen(false);
    updateColumnClock({ columnId: column.id, lock: lockType });
  };

  const handleCreateTask = async () => {
    if (newTaskTitle.trim()) {
      await createTask({
        title: newTaskTitle.trim(),
        columnId: column.id,
        assigneeId: userCurrent?.id,
        dueDate: tomorrowISO,
        position: 100.0,
        priority: TaskPriority.MEDIUM,
        description: "",
      });
      setNewTaskTitle("");
      setIsCreatingTask(false);
    } else {
      setIsCreatingTask(false);
    }
  };
  const handleDeleteColumn = async (id: string) => {
    try {
      await deleteColumn(id);
    } catch (error) {
      console.log(error);
    }
  };

  const handleTaskKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreateTask();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setNewTaskTitle("");
      setIsCreatingTask(false);
    }
  };

  const handleCreateColumnRight = () => {
    if (newColumnTitle.trim()) {
      createColumn({
        boardId: boardId,
        title: newColumnTitle.trim(),
        position: column.position + 1,
        lock_type: ColumnLockType.UNLOCKED,
      });
      setNewColumnTitle("");
      setIsCreatingColumn(false);
    } else {
      setIsCreatingColumn(false);
    }
  };

  const handleColKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateColumnRight();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setNewColumnTitle("");
      setIsCreatingColumn(false);
    }
  };

  return (
    <div className="flex gap-3 shrink-0 items-start">
      <div
        ref={setNodeRef}
        style={style}
        className={`group w-80 bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 flex flex-col max-h-full backdrop-blur-md shrink-0 relative ${
          isDragging ? "opacity-30 border-dashed border-indigo-500" : ""
        } ${isOverlay ? "ring-2 ring-indigo-500 shadow-2xl scale-105" : ""}`}>
        {/* Header Cột */}
        <div
          {...attributes}
          {...listeners}
          className="flex justify-between items-center mb-3 px-1 cursor-grab active:cursor-grabbing">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-200">{column.title}</h3>
            <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full font-medium border border-slate-700/50">
              {column.tasks?.length || 0}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            {/* SUB-MENU CHỌN TRẠNG THÁI KHÓA CỘT */}
            <div className="relative" ref={lockMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLockMenuOpen((prev) => !prev);
                  setIsMenuOpen(false);
                }}
                className="p-1 rounded-md hover:bg-slate-800 transition-colors"
                title="Cấu hình trạng thái khóa cột">
                {column.lock_type === ColumnLockType.UNLOCKED && (
                  <Unlock className="w-3.5 h-3.5 text-slate-400" />
                )}
                {column.lock_type === ColumnLockType.ONE_WAY_LOCKED && (
                  <ArrowDownLeft className="w-3.5 h-3.5 text-amber-500" />
                )}
                {column.lock_type === ColumnLockType.FULLY_LOCKED && (
                  <Lock className="w-3.5 h-3.5 text-red-500" />
                )}
              </button>

              {isLockMenuOpen && (
                <div className="absolute right-0 top-7 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 text-xs text-slate-300 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-700/60 mb-1">
                    Trạng thái khóa cột
                  </div>

                  {/* Option 1: Unlocked */}
                  <button
                    onClick={() => handleSelectLockType(ColumnLockType.UNLOCKED)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700/60 hover:text-white transition-colors text-left">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <div className="font-medium">Mở khóa</div>
                        <div className="text-[10px] text-slate-400">
                          Tự do di chuyển thẻ
                        </div>
                      </div>
                    </div>
                    {column.lock_type === ColumnLockType.UNLOCKED && (
                      <Check className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                  </button>

                  {/* Option 2: One Way Locked */}
                  <button
                    onClick={() => handleSelectLockType(ColumnLockType.ONE_WAY_LOCKED)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700/60 hover:text-white transition-colors text-left">
                    <div className="flex items-center gap-2">
                      <ArrowDownLeft className="w-3.5 h-3.5 text-amber-500" />
                      <div>
                        <div className="font-medium text-amber-400">Khóa 1 chiều</div>
                        <div className="text-[10px] text-slate-400">
                          Chỉ kéo vào, không kéo ra
                        </div>
                      </div>
                    </div>
                    {column.lock_type === ColumnLockType.ONE_WAY_LOCKED && (
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </button>

                  {/* Option 3: Fully Locked */}
                  <button
                    onClick={() => handleSelectLockType(ColumnLockType.FULLY_LOCKED)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700/60 hover:text-white transition-colors text-left">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-red-500" />
                      <div>
                        <div className="font-medium text-red-400">Khóa hoàn toàn</div>
                        <div className="text-[10px] text-slate-400">
                          Chặn mọi thao tác kéo thả
                        </div>
                      </div>
                    </div>
                    {column.lock_type === ColumnLockType.FULLY_LOCKED && (
                      <Check className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* SUB-MENU TÙY CHỌN CỘT (3 chấm) */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen((prev) => !prev);
                  setIsLockMenuOpen(false);
                }}
                className="hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-7 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 text-xs text-slate-300 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsCreatingColumn(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700/60 hover:text-white transition-colors text-left">
                    <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                    Thêm cột bên phải
                  </button>
                  <div className="my-1 border-t border-slate-700/60" />
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleDeleteColumn(column.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors text-left">
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa cột
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nút thêm Card */}
        {!isCreatingTask && (
          <button
            onClick={() => setIsCreatingTask(true)}
            className="mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 w-full py-2 bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-dashed border-slate-700">
            <Plus className="w-3.5 h-3.5" /> Add Card
          </button>
        )}

        {/* Form Tạo Card */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isCreatingTask
              ? "grid-rows-[1fr] opacity-100 mb-3"
              : "grid-rows-[0fr] opacity-0"
          }`}>
          <div className="overflow-hidden">
            <div className="bg-slate-800 border border-indigo-500/80 p-3 rounded-xl shadow-lg space-y-2">
              <textarea
                ref={taskInputRef}
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={handleTaskKeyDown}
                onBlur={handleCreateTask}
                placeholder="Nhập tiêu đề thẻ..."
                rows={2}
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none resize-none"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-700/50 pt-2">
                <span>Enter để lưu</span>
                <span>Esc để hủy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách Task */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-[60px]">
          <SortableContext items={tasksIds} strategy={verticalListSortingStrategy}>
            {column.tasks && column.tasks.length > 0 ? (
              column.tasks.map((task) => <TaskCard key={task.id} task={task} />)
            ) : (
              <div className="flex items-center justify-center h-20 text-slate-500 text-xs border border-dashed border-slate-800/80 rounded-xl">
                No tasks here
              </div>
            )}
          </SortableContext>
        </div>
      </div>

      {/* Cột phụ khi nhấn tạo thêm bên phải */}
      {isCreatingColumn && (
        <div className="w-80 bg-slate-900/70 border border-indigo-500/80 rounded-2xl p-3.5 flex flex-col backdrop-blur-md shrink-0 animate-in fade-in zoom-in-95 duration-150 shadow-2xl">
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="flex items-center gap-2 flex-1 mr-2">
              <input
                ref={colInputRef}
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={handleColKeyDown}
                onBlur={handleCreateColumnRight}
                placeholder="Nhập tên cột..."
                className="w-full bg-slate-800 text-sm font-bold text-slate-100 placeholder-slate-500 px-2.5 py-1 rounded-lg border border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="bg-slate-800 text-slate-500 text-xs px-2 py-0.5 rounded-full font-medium border border-slate-700/50">
                0
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <Unlock className="w-3.5 h-3.5" />
              <MoreHorizontal className="w-4 h-4 opacity-50" />
            </div>
          </div>

          <div className="flex items-center justify-center h-24 text-slate-500 text-xs border border-dashed border-slate-800/80 rounded-xl">
            No tasks here
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 px-1">
            <span>
              Nhấn{" "}
              <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">
                Enter
              </kbd>{" "}
              để tạo
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">
                Esc
              </kbd>{" "}
              để hủy
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
