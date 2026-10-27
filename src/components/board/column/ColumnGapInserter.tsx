"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Unlock } from "lucide-react";

interface ColumnGapInserterProps {
  onAddColumn: (title: string) => void;
  isEdgeLeft?: boolean; // Đánh dấu nếu là nút thêm ở tận cùng bên trái màn hình
}

export function ColumnGapInserter({
  onAddColumn,
  isEdgeLeft = false,
}: ColumnGapInserterProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating) {
      inputRef.current?.focus();
    }
  }, [isCreating]);

  const handleSubmit = () => {
    if (title.trim()) {
      onAddColumn(title.trim());
      setTitle("");
      setIsCreating(false);
    } else {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setTitle("");
      setIsCreating(false);
    }
  };

  // Trạng thái khi click vào -> Biến thành ô nhập tên cột chuẩn UI Kanban (Đẩy các cột cạnh bên ra)
  if (isCreating) {
    return (
      <div className="w-80 bg-slate-900/95 border border-indigo-500 rounded-2xl p-3.5 flex flex-col shrink-0 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto transition-all">
        <div className="flex justify-between items-center mb-3 px-1">
          <div className="flex items-center gap-2 flex-1 mr-2">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSubmit}
              placeholder="Nhập tên cột..."
              className="w-full bg-slate-800 text-sm font-bold text-slate-100 placeholder-slate-500 px-2.5 py-1 rounded-lg border border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="bg-slate-800 text-slate-500 text-xs px-2 py-0.5 rounded-full font-medium border border-slate-700/50">
              0
            </span>
          </div>
          <Unlock className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div className="flex items-center justify-center h-24 text-slate-500 text-xs border border-dashed border-slate-800/80 rounded-xl mb-3">
          No tasks here
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>
            Nhấn{" "}
            <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">
              Enter
            </kbd>{" "}
            để tạo
          </span>
          <span>
            Nhấn{" "}
            <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">
              Esc
            </kbd>{" "}
            để hủy
          </span>
        </div>
      </div>
    );
  }

  // Trạng thái bình thường: Khe hở thông minh giữa các cột (hoặc đầu bảng)
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 group cursor-pointer self-stretch transition-all duration-200 ${
        isEdgeLeft ? "w-8" : "w-6 hover:w-12"
      }`}
      onClick={() => setIsCreating(true)}>
      {/* Thanh dọc tàng hình, hover vào sẽ sáng lên màu tím và đẩy nhẹ không gian */}
      <div className="absolute inset-y-4 w-[2px] bg-transparent group-hover:bg-indigo-500/50 transition-all duration-200 rounded-full" />

      {/* Cột ảo / Nút bấm hiện lên khi rê chuột vào khe hở, đẩy cột bên phải ra */}
      <div className="absolute z-10 w-36 bg-slate-900/90 border border-dashed border-indigo-500/60 rounded-xl p-3 flex flex-col items-center justify-center gap-2 shadow-xl backdrop-blur-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
        <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">
          <Plus className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-slate-300 text-center">
          Thêm cột tại đây
        </span>
      </div>
    </div>
  );
}
