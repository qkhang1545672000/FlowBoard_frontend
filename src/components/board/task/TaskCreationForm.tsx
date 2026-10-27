"use client";

import React, { useEffect, useRef } from "react";

interface TaskCreationFormProps {
  isOpen: boolean;
  newTaskTitle: string;
  onTitleChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function TaskCreationForm({
  isOpen,
  newTaskTitle,
  onTitleChange,
  onSubmit,
  onCancel,
}: TaskCreationFormProps) {
  const taskInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      taskInputRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      className={`grid transition-all duration-300 ease-in-out ${
        isOpen ? "grid-rows-[1fr] opacity-100 mb-3" : "grid-rows-[0fr] opacity-0"
      }`}>
      <div className="overflow-hidden">
        <div className="bg-slate-800 border border-indigo-500/80 p-3 rounded-xl shadow-lg space-y-2">
          <textarea
            ref={taskInputRef}
            value={newTaskTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={onSubmit}
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
  );
}
