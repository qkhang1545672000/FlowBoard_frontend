"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { TaskChecklistItem } from "./TaskChecklistItem";
import {
  useSubTasks,
  useCreateSubTask,
  useUpdateSubTask,
  useDeleteSubTask,
} from "@/hooks/useSubTask";
import { useBoardStore } from "@/store/useBoardStore";
import { Task } from "@/types/column";

interface TaskChecklistTabProps {
  task: Task;
}

export function TaskChecklistTab({ task }: TaskChecklistTabProps) {
  const boardId = useBoardStore((state) => state.activeBoardId) ?? "";
  const [newChecklistText, setNewChecklistText] = useState("");

  // Gọi hooks quản lý SubTask
  const { data: checklistItems = [], isLoading } = useSubTasks(task.id);

  const createSubTaskMutation = useCreateSubTask(task.id, boardId);
  const updateSubTaskMutation = useUpdateSubTask(task.id, boardId);
  const deleteSubTaskMutation = useDeleteSubTask(task.id, boardId);

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    createSubTaskMutation.mutate(
      {
        taskId: task.id,
        title: newChecklistText.trim(),
      },
      {
        onSuccess: () => {
          setNewChecklistText("");
        },
      },
    );
  };

  const completedCount = checklistItems.filter((i) => i.completed).length;
  const totalCount = checklistItems.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-xs text-slate-400">
        Đang tải danh sách công việc...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
      {/* Thanh tiến độ tổng quan */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200">
            Danh sách công việc ({completedCount}/{totalCount} hoàn thành)
          </span>
        </div>
        <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Danh sách các mục công việc */}
      <div className="space-y-2 flex-1 overflow-y-auto pr-1">
        {checklistItems.map((item, index) => (
          <TaskChecklistItem
            key={item.id}
            item={item}
            index={index}
            task={task}
            onToggleComplete={() =>
              updateSubTaskMutation.mutate({
                id: item.id,
                dto: { completed: !item.completed },
              })
            }
            onUpdateAssignee={(memberId) =>
              updateSubTaskMutation.mutate({
                id: item.id,
                dto: { assigneeId: memberId },
              })
            }
            onSaveDates={(start, due) =>
              updateSubTaskMutation.mutate({
                id: item.id,
                dto: { startDate: start, dueDate: due },
              })
            }
            onDelete={() => deleteSubTaskMutation.mutate(item.id)}
          />
        ))}
      </div>

      {/* Ô thêm mục mới nhanh */}
      <form onSubmit={handleAddChecklist} className="pt-2 shrink-0 space-y-1.5">
        <span className="text-[11px] font-medium text-slate-400">Thêm mục mới...</span>
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/70 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 transition-colors">
          <input
            type="text"
            value={newChecklistText}
            onChange={(e) => setNewChecklistText(e.target.value)}
            placeholder="Viết tên công việc..."
            className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newChecklistText.trim() || createSubTaskMutation.isPending}
            className="p-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
