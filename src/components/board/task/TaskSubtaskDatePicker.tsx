"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Clock, X } from "lucide-react";

interface TaskSubtaskDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  startDate?: string | null;
  dueDate?: string | null;
  onSave: (startDate: string | null, dueDate: string | null) => void;
}

const formatToDatetimeLocal = (dateString?: string | null): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export function TaskSubtaskDatePicker({
  isOpen,
  onClose,
  startDate,
  dueDate,
  onSave,
}: TaskSubtaskDatePickerProps) {
  const [start, setStart] = useState<string>(formatToDatetimeLocal(startDate));
  const [end, setEnd] = useState<string>(formatToDatetimeLocal(dueDate));

  useEffect(() => {
    setStart(formatToDatetimeLocal(startDate));
    setEnd(formatToDatetimeLocal(dueDate));
  }, [startDate, dueDate]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(
      start ? new Date(start).toISOString() : null,
      end ? new Date(end).toISOString() : null,
    );
    onClose();
  };

  const handleClear = () => {
    setStart("");
    setEnd("");
    onSave(null, null);
    onClose();
  };

  return createPortal(
    <>
      {/* Lớp nền trong suốt tuyệt đối: click ra ngoài chỉ đóng popup này, giữ nguyên modal cha */}
      <div
        className="fixed inset-0 z-[99998] bg-transparent"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      {/* Khung modal được canh giữa màn hình */}
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto bg-slate-900 border border-slate-700 rounded-2xl p-4 w-80 shadow-2xl space-y-4 text-slate-100 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h4 className="text-xs font-semibold flex items-center gap-1.5 text-indigo-400">
              <Clock className="w-4 h-4" /> Thời gian công việc con
            </h4>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Inputs */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-400">
                Bắt đầu (Ngày & Giờ)
              </label>
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                style={{ colorScheme: "dark" }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-400">
                Hết hạn / Deadline (Ngày & Giờ)
              </label>
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                style={{ colorScheme: "dark" }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 bg-slate-800 hover:bg-red-500/10 text-red-400 text-xs font-medium rounded-xl transition-colors">
              Xóa lịch
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition-colors shadow-lg shadow-indigo-600/20">
              Lưu
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
