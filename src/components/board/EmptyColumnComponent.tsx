"use client";

import React, { useState, useRef, useEffect } from "react";
import { PlusCircle, Plus, Unlock } from "lucide-react";
import { useBoardStore } from "@/store/useBoardStore";
import { useCreateColumn } from "@/hooks/useColumn";
import { ColumnLockType } from "@/types";

export function EmptyColumnComponent() {
  const boardId = useBoardStore((state) => state.activeBoardId) ?? "";
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: createColumn, isPending: isCreatingColumnn } = useCreateColumn(boardId);

  useEffect(() => {
    if (isCreating) {
      inputRef.current?.focus();
    }
  }, [isCreating]);

  const handleSubmit = () => {
    if (title.trim()) {
      createColumn({
        title,
        boardId: boardId,
        lock_type: ColumnLockType.UNLOCKED,
        position: 1000.0,
      });
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

  return (
    <div className="w-80 bg-slate-900/50 border border-dashed border-slate-700/80 rounded-2xl p-3.5 flex flex-col shrink-0 backdrop-blur-md transition-all hover:border-indigo-500/50">
      {!isCreating ? (
        /* Nút tạo cột đầu tiên */
        <button
          onClick={() => setIsCreating(true)}
          className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400 hover:text-indigo-400 transition-colors w-full rounded-xl hover:bg-slate-800/40">
          <div className="p-3 bg-slate-800 rounded-full border border-slate-700">
            <Plus className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-sm font-semibold">Tạo cột đầu tiên</span>
        </button>
      ) : (
        /* Form nhập tên cột khi tạo (giao diện khớp chuẩn với ColumnComponent) */
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center px-1">
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
