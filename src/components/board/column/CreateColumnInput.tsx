"use client";

import React, { useState, useRef, useEffect } from "react";
import { Unlock } from "lucide-react";

interface CreateColumnInputProps {
  onSubmit: (title: string) => void;
  onCancel: () => void;
}

export function CreateColumnInput({ onSubmit, onCancel }: CreateColumnInputProps) {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Tự động focus vào ô input khi component vừa xuất hiện
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleBlur = () => {
    if (title.trim()) {
      onSubmit(title.trim());
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (title.trim()) {
        onSubmit(title.trim());
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="flex flex-col space-y-3 w-80 bg-slate-900/95 border border-indigo-500 rounded-2xl p-3.5 shrink-0 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2 flex-1 mr-2">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Nhập tên cột..."
            className="w-full bg-slate-800 text-sm font-bold text-slate-100 placeholder-slate-500 px-2.5 py-1 rounded-lg border border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span className="bg-slate-800 text-slate-500 text-xs px-2 py-0.5 rounded-full font-medium border border-slate-700/50">
            0
          </span>
        </div>
        <Unlock className="w-3.5 h-3.5 text-slate-500" />
      </div>

      <div className="flex items-center justify-center h-24 text-slate-500 text-xs border border-dashed border-slate-800/80 rounded-xl">
        No tasks here
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 px-1">
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
