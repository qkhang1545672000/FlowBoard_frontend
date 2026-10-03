"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column, ColumnLockType } from "@/types/column";
import { Plus, MoreHorizontal, Lock, Unlock, Trash2, PlusCircle } from "lucide-react";
import { TaskCard } from "./taskCard";
import { useCreateTask } from "@/hooks/useTask";
import { useBoardStore } from "@/store/useBoardStore";
import { useAuthStore } from "@/store/useAuthStore";
import { TaskPriority } from "@/types";
import { useCreateColumn } from "@/hooks/useColumn";

interface Props {
  column: Column;
  isOverlay?: boolean;
  onAddTask?: (columnId: string, title: string) => void;
  onAddColumnRight?: (targetColumnId: string, title: string) => void;
  onDeleteColumn?: (columnId: string) => void;
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
  const { mutate: createTask, isPending } = useCreateTask(boardId);
  const { mutate: createColumn, isPending: isCreatingColumnn } = useCreateColumn(boardId);
  // Trạng thái tạo task mới
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const taskInputRef = useRef<HTMLTextAreaElement>(null);
  // Lấy thời gian hiện tại và cộng thêm 1 ngày
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. Nếu cần truyền dạng ISO String (ví dụ: '2026-10-04T08:14:00.000Z') cho API/Database:
  const tomorrowISO = tomorrow.toISOString();

  // Trạng thái Sub Menu 3 chấm
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Trạng thái tạo cột mới nằm bên phải
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

  // Focus ô nhập task
  useEffect(() => {
    if (isCreatingTask) {
      taskInputRef.current?.focus();
    }
  }, [isCreatingTask]);

  // Focus ô nhập tiêu đề cột mới khi bật tạo cột
  useEffect(() => {
    if (isCreatingColumn) {
      colInputRef.current?.focus();
    }
  }, [isCreatingColumn]);

  // Đóng Sub Menu khi nhấp chuột ra ngoài
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

  // Xử lý tạo Task
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

  // Xử lý tạo Cột mới bên phải
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
      {/* Cột hiện tại */}
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
          <div className="flex items-center gap-1 text-slate-400">
            {column.lock_type === ColumnLockType.UNLOCKED ? (
              <Unlock className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-500" />
            )}

            {/* Nút 3 chấm & Sub Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen((prev) => !prev);
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
                      if (onDeleteColumn) onDeleteColumn(column.id);
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

        {/* Button thêm Card */}
        {!isCreatingTask && (
          <button
            onClick={() => setIsCreatingTask(true)}
            className="mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 w-full py-2 bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-dashed border-slate-700">
            <Plus className="w-3.5 h-3.5" /> Add Card
          </button>
        )}

        {/* Form Tạo Card Trượt Xuống */}
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

      {/* Cột trống hiển thị bên phải khi nhấn Thêm cột (Mockup giống hình ảnh của bạn) */}
      {isCreatingColumn && (
        <div className="w-80 bg-slate-900/70 border border-indigo-500/80 rounded-2xl p-3.5 flex flex-col backdrop-blur-md shrink-0 animate-in fade-in zoom-in-95 duration-150 shadow-2xl">
          {/* Header với Input nhập tiêu đề */}
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

          {/* Vùng trống chứa task (No tasks here) */}
          <div className="flex items-center justify-center h-24 text-slate-500 text-xs border border-dashed border-slate-800/80 rounded-xl">
            No tasks here
          </div>

          {/* Hướng dẫn thao tác */}
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
