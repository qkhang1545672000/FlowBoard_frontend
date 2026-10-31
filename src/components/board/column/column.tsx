/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Column, ColumnLockType } from "@/types/column";
import { Plus, GripVertical } from "lucide-react";
import { TaskCard } from "../task/taskCard";
import { useCreateTask } from "@/hooks/useTask";
import { useBoardStore } from "@/store/useBoardStore";
import { TaskPriority } from "@/types";
import {
  useCreateColumn,
  useDeleteColumn,
  useUpdateColumnClock,
} from "@/hooks/useColumn";
import { useBoardPermission } from "../useBoardPermission";
import { useWorkspacePermission } from "../../workspace/useWorkspacePermission";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

// Import các sub-components đã tách
import { ColumnLockMenu } from "./ColumnLockMenu";
import { ColumnOptionsMenu } from "./ColumnOptionsMenu";
import { TaskCreationForm } from "../task/TaskCreationForm";
import { CreateColumnInput } from "./CreateColumnInput";
import { LoadingModal } from "@/components/ui/loading-modal";

interface Props {
  column: Column;
  isOverlay?: boolean;
}

export function ColumnComponent({ column, isOverlay }: Props) {
  const boardId = useBoardStore((state) => state.activeBoardId) ?? "";
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId) ?? "";

  const { mutate: createTask, isPending: isPendingCreateTask } = useCreateTask(boardId);
  const { mutate: updateColumnClock } = useUpdateColumnClock(boardId);
  const { mutate: deleteColumn } = useDeleteColumn(boardId);
  const { mutate: createColumn } = useCreateColumn(boardId);

  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLockMenuOpen, setIsLockMenuOpen] = useState(false);

  const [isCreatingColumn, setIsCreatingColumn] = useState(false);

  const { isOwn } = useBoardPermission(boardId);
  const { isOwn: isOwnWorkspace } = useWorkspacePermission(workspaceId);
  const isPermissonCreateTask = isOwn || isOwnWorkspace;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const tomorrowISO = tomorrow.toISOString();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const tasksIds = useMemo(() => {
    return column.tasks ? column.tasks.map((task) => task.id) : [];
  }, [column.tasks]);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "COLUMN", column },
  });

  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: column.id,
    data: { type: "COLUMN", columnId: column.id },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const setCombinedRef = (node: HTMLDivElement | null) => {
    setSortableNodeRef(node);
    setDroppableNodeRef(node);
  };

  const handleCreateTask = async () => {
    if (newTaskTitle.trim()) {
      await createTask({
        title: newTaskTitle.trim(),
        columnId: column.id,
        startDate: todayISO,
        dueDate: tomorrowISO,
        priority: TaskPriority.MEDIUM,
        description: "",
      });
      setNewTaskTitle("");
      setIsCreatingTask(false);
    } else {
      setIsCreatingTask(false);
    }
  };
  if (isPendingCreateTask) {
    return (
      <LoadingModal
        isOpen={isPendingCreateTask}
        message="Xin chờ trong giây lát"
        blurBackground={true}
      />
    );
  }

  // Hàm xử lý khi submit tạo cột mới từ CreateColumnInput
  const handleCreateColumnSubmit = (title: string) => {
    createColumn({
      title,
      boardId,
      lock_type: ColumnLockType.UNLOCKED,
    }); // Gọi API tạo cột mới
    setIsCreatingColumn(false);
  };

  return (
    // Bọc toàn bộ trong flex gap-3 để Cột và Ô tạo cột mới (nếu có) đứng cạnh nhau theo hàng ngang
    <div className="flex gap-3 shrink-0 items-start">
      {/* Khung Cột hiện tại */}
      <div
        ref={setCombinedRef}
        style={style}
        className={`group w-80  bg-slate-900/70 border border-slate-800 rounded-2xl p-2 flex flex-col max-h-[80vh] backdrop-blur-md shrink-0 relative ${
          isDragging ? "opacity-30 border-dashed border-indigo-500" : ""
        } ${isOverlay ? "ring-2 ring-indigo-500 shadow-2xl scale-105" : ""}`}>
        {/* Header Cột */}
        <div className="flex justify-between items-center mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <button
              {...attributes}
              {...listeners}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded cursor-grab active:cursor-grabbing shrink-0">
              <GripVertical className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-sm text-slate-200 truncate">{column.title}</h3>
            <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full font-medium border border-slate-700/50 shrink-0">
              {column.tasks?.length || 0}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            {/* Menu khóa cột */}
            <ColumnLockMenu
              isOpen={isLockMenuOpen}
              onClose={() => setIsLockMenuOpen(false)}
              onToggle={(e) => {
                e.stopPropagation();
                setIsLockMenuOpen((prev) => !prev);
                setIsMenuOpen(false);
              }}
              currentLockType={column.lock_type}
              onSelectLockType={(lockType) => {
                setIsLockMenuOpen(false);
                updateColumnClock({ boardId, columnId: column.id, lock: lockType });
              }}
              canEdit={Boolean(isOwn || isOwnWorkspace)}
            />

            {/* Menu 3 chấm */}
            <ColumnOptionsMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              onToggle={(e) => {
                e.stopPropagation();
                setIsMenuOpen((prev) => !prev);
                setIsLockMenuOpen(false);
              }}
              onAddColumnRight={() => setIsCreatingColumn(true)}
              onDeleteColumn={() => deleteColumn(column.id)}
            />
          </div>
        </div>

        {/* Nút thêm Card */}
        {isPermissonCreateTask ? (
          !isCreatingTask && (
            <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-200 overflow-hidden">
              <div className="min-h-0">
                <button
                  type="button"
                  onClick={() => setIsCreatingTask(true)}
                  className="mb-3 flex items-center justify-center gap-2 w-full py-2 bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-dashed border-slate-700 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Card
                </button>
              </div>
            </div>
          )
        ) : (
          <div></div>
        )}

        {/* Form Tạo Card */}
        <TaskCreationForm
          isOpen={isCreatingTask}
          newTaskTitle={newTaskTitle}
          onTitleChange={setNewTaskTitle}
          onSubmit={handleCreateTask}
          onCancel={() => {
            setNewTaskTitle("");
            setIsCreatingTask(false);
          }}
        />

        {/* Danh sách Task */}
        <div className="flex-1 min-h-0 h-75 overflow-y-auto pr-1 pl-1 space-y-3">
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

      {/* <CreateColumnInput /> hiển thị ngay bên phải cột hiện tại khi người dùng bấm "Thêm cột bên phải" */}
      {isCreatingColumn && (
        <CreateColumnInput
          onSubmit={handleCreateColumnSubmit}
          onCancel={() => setIsCreatingColumn(false)}
        />
      )}
    </div>
  );
}
