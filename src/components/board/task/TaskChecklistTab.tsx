"use client";

import React, { useState } from "react";
import { Plus, Calendar, User as UserIcon, Check } from "lucide-react";
import { TaskAssigneeDropdown } from "./TaskAssigneeDropdown";
import { TaskSubtaskDatePicker } from "./TaskSubtaskDatePicker"; // 👈 Sử dụng component mới

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  assignee?: string;
  startDate?: string | null;
  dueDate?: string | null;
}

interface TaskChecklistTabProps {
  initialItems?: ChecklistItem[];
  taskStartDate?: string;
  taskDueDate?: string;
}

const MOCK_TEAM_MEMBERS = [
  { id: "m1", name: "Alex" },
  { id: "m2", name: "Mia" },
  { id: "m3", name: "Ben" },
  { id: "m4", name: "John Doe" },
];

export function TaskChecklistTab({
  initialItems,
  taskStartDate,
  taskDueDate,
}: TaskChecklistTabProps) {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
    initialItems || [
      {
        id: "1",
        title: "Phân tích đề tài luận văn",
        completed: true,
        assignee: "Alex",
        startDate: null,
        dueDate: "2026-10-15T23:59",
      },
      { id: "2", title: "Thu thập tài liệu tham khảo", completed: true },
      { id: "3", title: "Xây dựng đề cương chi tiết", completed: false },
      { id: "4", title: "Viết Chương 1", completed: true },
      { id: "5", title: "Viết Chương 2", completed: false },
    ],
  );
  const [newChecklistText, setNewChecklistText] = useState("");

  const [activeAssigneeDropdown, setActiveAssigneeDropdown] = useState<{
    itemId: string;
    coords: { top: number; left: number };
  } | null>(null);

  // Quản lý ID của subtask đang mở modal chọn ngày
  const [activeDatePickerItemId, setActiveDatePickerItemId] = useState<string | null>(
    null,
  );

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      title: newChecklistText.trim(),
      completed: false,
    };

    setChecklistItems([...checklistItems, newItem]);
    setNewChecklistText("");
  };

  const toggleChecklistItem = (id: string) => {
    setChecklistItems(
      checklistItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  const handleUpdateAssignee = (id: string, assigneeName: string) => {
    setChecklistItems(
      checklistItems.map((item) =>
        item.id === id ? { ...item, assignee: assigneeName } : item,
      ),
    );
  };

  const handleUpdateItemDates = (
    id: string,
    start: string | null,
    due: string | null,
  ) => {
    setChecklistItems(
      checklistItems.map((item) =>
        item.id === id ? { ...item, startDate: start, dueDate: due } : item,
      ),
    );
  };

  const completedCount = checklistItems.filter((i) => i.completed).length;
  const totalCount = checklistItems.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
      {/* Thanh tiến độ tổng quan */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200">
            Danh sách công việc ({completedCount}/{totalCount} hoàn thành)
          </span>
          <button
            type="button"
            onClick={() => {
              const title = prompt("Nhập tên checklist mới:");
              if (title) {
                setChecklistItems([
                  ...checklistItems,
                  { id: Date.now().toString(), title, completed: false },
                ]);
              }
            }}
            className="text-indigo-400 hover:text-indigo-300 font-medium text-[11px]">
            Thêm Checklist mới
          </button>
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
          <div
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              item.completed
                ? "bg-slate-800/30 border-slate-800 text-slate-400 line-through"
                : "bg-slate-800/60 border-slate-700/50 hover:bg-slate-800 text-slate-200"
            }`}>
            <div
              onClick={() => toggleChecklistItem(item.id)}
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
              <span className="text-xs font-medium truncate">
                {index + 1}. {item.title}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 text-slate-400 text-[10px]">
              {/* Nút bấm User */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActiveAssigneeDropdown(
                      activeAssigneeDropdown?.itemId === item.id
                        ? null
                        : {
                            itemId: item.id,
                            coords: { top: rect.bottom + 6, left: rect.left },
                          },
                    );
                    setActiveDatePickerItemId(null);
                  }}
                  className={`flex items-center gap-1 bg-slate-900/80 hover:bg-slate-800 px-2 py-1 rounded-lg border border-slate-700/60 transition-colors ${
                    item.assignee ? "text-indigo-400 font-medium" : "text-slate-400"
                  }`}>
                  <UserIcon className="w-3 h-3" />
                  <span>{item.assignee || "Giao việc"}</span>
                </button>

                {activeAssigneeDropdown?.itemId === item.id && (
                  <TaskAssigneeDropdown
                    isOpen={true}
                    onClose={() => setActiveAssigneeDropdown(null)}
                    members={MOCK_TEAM_MEMBERS}
                    currentAssignee={item.assignee}
                    onSelect={(name) => handleUpdateAssignee(item.id, name)}
                    coords={activeAssigneeDropdown.coords}
                  />
                )}
              </div>

              {/* Nút bấm mở lịch bằng TaskSubtaskDatePicker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDatePickerItemId(item.id);
                    setActiveAssigneeDropdown(null);
                  }}
                  className={`flex items-center gap-1 bg-slate-900/80 hover:bg-slate-800 px-2 py-1 rounded-lg border border-slate-700/60 transition-colors ${
                    item.dueDate ? "text-amber-400 font-medium" : "text-slate-400"
                  }`}>
                  <Calendar className="w-3 h-3" />
                  <span>
                    {item.dueDate
                      ? new Date(item.dueDate).toLocaleDateString("vi-VN")
                      : "Hạn chót"}
                  </span>
                </button>

                <TaskSubtaskDatePicker
                  isOpen={activeDatePickerItemId === item.id}
                  onClose={() => setActiveDatePickerItemId(null)}
                  startDate={item.startDate}
                  dueDate={item.dueDate}
                  onSave={(start, due) => handleUpdateItemDates(item.id, start, due)}
                />
              </div>
            </div>
          </div>
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
            disabled={!newChecklistText.trim()}
            className="p-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
