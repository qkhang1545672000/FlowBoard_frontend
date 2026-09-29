"use client";

import { useState } from "react";
import { Folder, Loader2 } from "lucide-react";

interface CreateWorkspaceCardProps {
  onCancel: () => void;
  onSubmit: (title: string) => Promise<void> | void;
}

const CreateWorkspaceCard = ({ onCancel, onSubmit }: CreateWorkspaceCardProps) => {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(title.trim());
    } catch (error) {
      console.error("Error creating workspace:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 bg-slate-900/80 border border-indigo-500/80 p-4 rounded-2xl shadow-lg flex flex-col justify-between space-y-4 backdrop-blur-md min-h-[110px]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 w-full">
          <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/50 flex-shrink-0">
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            ) : (
              <Folder className="w-5 h-5 text-indigo-400" />
            )}
          </div>

          <div className="flex-1">
            <input
              type="text"
              autoFocus
              disabled={isSubmitting}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!title.trim()) onCancel();
              }}
              placeholder="Nhập tên workspace..."
              className="w-full bg-slate-800/80 border border-indigo-500/50 focus:border-indigo-400 focus:outline-none rounded-lg px-2.5 py-1 text-sm font-semibold text-slate-100 placeholder:text-slate-500"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Bấm{" "}
              <kbd className="px-1 py-0.5 text-[10px] bg-slate-800 rounded border border-slate-700">
                Enter
              </kbd>{" "}
              để tạo,{" "}
              <kbd className="px-1 py-0.5 text-[10px] bg-slate-800 rounded border border-slate-700">
                Esc
              </kbd>{" "}
              để hủy
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/60 pt-3">
        <span>0 boards</span>
        <span>Mới</span>
      </div>
    </div>
  );
};

export default CreateWorkspaceCard;
