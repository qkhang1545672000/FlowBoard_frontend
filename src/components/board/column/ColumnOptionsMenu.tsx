"use client";

import React, { useRef, useEffect } from "react";
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";

interface ColumnOptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: (e: React.MouseEvent) => void;
  onAddColumnRight: () => void;
  onDeleteColumn: () => void;
}

export function ColumnOptionsMenu({
  isOpen,
  onClose,
  onToggle,
  onAddColumnRight,
  onDeleteColumn,
}: ColumnOptionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={onToggle}
        className="hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors">
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-7 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 text-xs text-slate-300 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={() => {
              onClose();
              onAddColumnRight();
              console.log("helllllo");
            }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700/60 hover:text-white transition-colors text-left">
            <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
            Thêm cột bên phải
          </button>
          <div className="my-1 border-t border-slate-700/60" />
          <button
            onClick={() => {
              onClose();
              onDeleteColumn();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors text-left">
            <Trash2 className="w-3.5 h-3.5" />
            Xóa cột
          </button>
        </div>
      )}
    </div>
  );
}
