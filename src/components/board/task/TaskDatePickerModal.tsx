"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Calendar as CalendarIcon, Clock } from "lucide-react";

interface TaskDatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate?: string;
  taskStartDate?: string; // Hạn bắt đầu của task chính
  taskDueDate?: string; // Hạn chót của task chính
  onSave: (dateStr: string) => void;
}

export function TaskDatePickerModal({
  isOpen,
  onClose,
  currentDate,
  taskStartDate,
  taskDueDate,
  onSave,
}: TaskDatePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState(currentDate || "");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    // Kiểm tra ràng buộc thực tế dựa trên task chính (nếu có)
    if (taskStartDate && selectedDate < taskStartDate) {
      setErrorMsg(`Ngày không được trước ngày bắt đầu task (${taskStartDate})`);
      return;
    }
    if (taskDueDate && selectedDate > taskDueDate) {
      setErrorMsg(`Ngày không được vượt quá hạn chót task (${taskDueDate})`);
      return;
    }

    onSave(selectedDate);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col text-slate-200 p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-indigo-400" /> Chọn thời hạn công việc
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thông tin nhắc nhở khoảng thời gian của Task chính */}
        {(taskStartDate || taskDueDate) && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-2.5 text-[11px] text-slate-400 space-y-1">
            <span className="font-medium text-slate-300">Khung thời gian cho phép:</span>
            <div className="flex justify-between">
              <span>Bắt đầu: {taskStartDate || "Không giới hạn"}</span>
              <span>Hạn chót: {taskDueDate || "Không giới hạn"}</span>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-medium">Chọn ngày:</label>
          <input
            type="date"
            value={selectedDate}
            min={taskStartDate}
            max={taskDueDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setErrorMsg("");
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          {errorMsg && <p className="text-[10px] text-rose-400 mt-1">{errorMsg}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors">
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium transition-colors">
            Lưu
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
