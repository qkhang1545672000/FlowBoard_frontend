/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Calendar, User as UserIcon, Check, Trash2 } from "lucide-react";
import { TaskAssigneeDropdown } from "./TaskAssigneeDropdown";
import { TaskSubtaskDatePicker } from "./TaskSubtaskDatePicker";
import { SubTask } from "@/services/sub-task.service";

import { Task } from "@/types/column";
import { useTaskPermission } from "./useTaskPermission";
import { useBoardStore } from "@/store/useBoardStore";
import { useBoardPermission } from "../useBoardPermission";
import { useWorkspacePermission } from "@/components/workspace/useWorkspacePermission";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { TaskTooltipTitle } from "@/components/ui/TaskTooltipTitle";

interface TaskChecklistItemProps {
  item: SubTask;
  index: number;
  task: Task;
  onToggleComplete: () => void;
  onUpdateAssignee: (memberId: string) => void;
  onSaveDates: (startDate: string | null, dueDate: string | null) => void;
  onDelete: () => void;
}

export function TaskChecklistItem({
  item,
  index,
  task,
  onToggleComplete,
  onUpdateAssignee,
  onSaveDates,
  onDelete,
}: TaskChecklistItemProps) {
  const [activeAssigneeDropdown, setActiveAssigneeDropdown] = useState<{
    coords: { top: number; left: number };
  } | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // 🟢 Hook tính toán thời gian thực từng giây giống như trong TaskCard
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (!item.startDate || !item.dueDate) {
      setTimeRemaining(item.timeLeft || "");
      return;
    }

    const start = new Date(item.startDate).getTime();
    const end = new Date(item.dueDate).getTime();

    const calculate = () => {
      const now = Date.now();

      if (start >= end || now >= end) {
        setTimeRemaining("Đã quá hạn");
        return;
      }

      if (now <= start) {
        const diffToStart = start - now;
        const days = Math.floor(diffToStart / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diffToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const mins = Math.floor((diffToStart % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diffToStart % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeRemaining(`Bắt đầu sau ${days} ngày`);
        } else if (hours > 0) {
          setTimeRemaining(`Bắt đầu sau ${hours}h ${mins}p`);
        } else {
          setTimeRemaining(`Bắt đầu sau ${mins}p ${secs}s`);
        }
        return;
      }

      const diff = end - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`Còn ${days} ngày`);
      } else if (hours > 0) {
        setTimeRemaining(`Còn ${hours}h ${mins}p`);
      } else {
        setTimeRemaining(`Còn ${mins}p ${secs}s`);
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [item.startDate, item.dueDate, item.timeLeft]);

  const taskDueDate = task.dueDate;
  const boardId = useBoardStore((state) => state.activeBoardId) ?? "";
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId) ?? "";
  const taskStartDate = task.startDate;
  const taskMembers = task.members;
  const { isTaskLeader } = useTaskPermission(boardId, task.id);
  const { isOwn } = useBoardPermission(boardId);
  const { isOwn: isOwnW } = useWorkspacePermission(workspaceId);
  const isPermission = isTaskLeader || isOwn || isOwnW;

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
        item.completed
          ? "bg-slate-800/30 border-slate-800 text-slate-400 line-through"
          : "bg-slate-800/60 border-slate-700/50 hover:bg-slate-800 text-slate-200"
      }`}>
      {/* Checkbox & Tiêu đề */}
      <div
        onClick={onToggleComplete}
        className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1 mr-2">
        <button
          type="button"
          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
            item.completed
              ? "bg-indigo-600 border-indigo-600 text-white"
              : "border-slate-500 bg-slate-900/40"
          }`}>
          {item.completed && <Check className="w-3 h-3" />}
        </button>
        <span className="text-xs font-medium truncate w-max-[400px]">
          <TaskTooltipTitle
            title={`${index + 1}. ${item.title}`}
            className="max-w-[200px]"
          />
        </span>
      </div>

      {/* Nhóm Actions (Giao việc, Chọn ngày, Xóa) */}
      <div className="flex items-center gap-2 shrink-0 text-slate-400 text-[10px]">
        {/* Nút bấm Giao việc (Assignee) */}
        {isPermission ? (
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setActiveAssigneeDropdown(
                  activeAssigneeDropdown
                    ? null
                    : { coords: { top: rect.bottom + 6, left: rect.left } },
                );
                setIsDatePickerOpen(false);
              }}
              className={`flex items-center gap-1 bg-slate-900/80 hover:bg-slate-800 px-2 py-1 rounded-lg border border-slate-700/60 transition-colors ${
                item.assignee ? "text-indigo-400 font-medium" : "text-slate-400"
              }`}>
              <UserIcon className="w-3 h-3" />
              <span>{item.assignee?.name || "Giao việc"}</span>
            </button>
            {isPermission
              ? activeAssigneeDropdown && (
                  <TaskAssigneeDropdown
                    isOpen={true}
                    onClose={() => setActiveAssigneeDropdown(null)}
                    members={taskMembers}
                    currentAssignee={item.assignee?.name || undefined}
                    onSelect={(id) => {
                      onUpdateAssignee(id);
                      setActiveAssigneeDropdown(null);
                    }}
                    coords={activeAssigneeDropdown.coords}
                  />
                )
              : null}
          </div>
        ) : (
          <div
            className={`flex items-center gap-1 bg-slate-900/80 hover:bg-slate-800 px-2 py-1 rounded-lg border border-slate-700/60 transition-colors ${
              item.assignee ? "text-indigo-400 font-medium" : "text-slate-400"
            }`}>
            <span>{item.assignee?.name}</span>
          </div>
        )}

        {/* Nút bấm chọn thời gian (DatePicker) với thời gian chạy thời gian thực */}
        {isPermission ? (
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDatePickerOpen(true);
                setActiveAssigneeDropdown(null);
              }}
              className={`flex items-center gap-1 bg-slate-900/80 hover:bg-slate-800 px-2 py-1 rounded-lg border border-slate-700/60 transition-colors ${
                item.dueDate ? "text-amber-400 font-medium" : "text-slate-400"
              }`}>
              <Calendar className="w-3 h-3" />
              <span>{timeRemaining ? timeRemaining : "Hạn chót"}</span>
            </button>

            <TaskSubtaskDatePicker
              isOpen={isDatePickerOpen}
              onClose={() => setIsDatePickerOpen(false)}
              startDate={item.startDate}
              dueDate={item.dueDate}
              taskStartDate={taskStartDate}
              taskDueDate={taskDueDate}
              onSave={(start, due) => {
                onSaveDates(start, due);
                setIsDatePickerOpen(false);
              }}
            />
          </div>
        ) : (
          <div
            className={`flex items-center gap-1 bg-slate-900/80 hover:bg-slate-800 px-2 py-1 rounded-lg border border-slate-700/60 transition-colors ${
              item.dueDate ? "text-amber-400 font-medium" : "text-slate-400"
            }`}>
            {timeRemaining ? timeRemaining : "chưa có"}
          </div>
        )}

        {/* Nút Xóa SubTask */}
        {isPermission && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Bạn có chắc chắn muốn xóa công việc con này?")) {
                onDelete();
              }
            }}
            className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Xóa công việc con">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
