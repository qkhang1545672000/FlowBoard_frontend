"use client";

import React, { useRef, useEffect } from "react";
import { Lock, Unlock, ArrowDownLeft, Check } from "lucide-react";
import { ColumnLockType } from "@/types/column";

interface ColumnLockMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: (e: React.MouseEvent) => void;
  currentLockType: ColumnLockType;
  onSelectLockType: (lockType: ColumnLockType) => void;
  canEdit: boolean;
}

export function ColumnLockMenu({
  isOpen,
  onClose,
  onToggle,
  currentLockType,
  onSelectLockType,
  canEdit,
}: ColumnLockMenuProps) {
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
        className="p-1 rounded-md hover:bg-slate-800 transition-colors"
        title="Cấu hình trạng thái khóa cột">
        {currentLockType === ColumnLockType.UNLOCKED && (
          <Unlock className="w-3.5 h-3.5 text-slate-400" />
        )}
        {currentLockType === ColumnLockType.ONE_WAY_LOCKED && (
          <ArrowDownLeft className="w-3.5 h-3.5 text-amber-500" />
        )}
        {currentLockType === ColumnLockType.FULLY_LOCKED && (
          <Lock className="w-3.5 h-3.5 text-red-500" />
        )}
      </button>

      {isOpen && canEdit && (
        <div className="absolute right-0 top-7 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 text-xs text-slate-300 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-700/60 mb-1">
            Trạng thái khóa cột
          </div>

          <button
            onClick={() => onSelectLockType(ColumnLockType.UNLOCKED)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700/60 hover:text-white transition-colors text-left">
            <div className="flex items-center gap-2">
              <Unlock className="w-3.5 h-3.5 text-slate-400" />
              <div>
                <div className="font-medium">Mở khóa</div>
                <div className="text-[10px] text-slate-400">Tự do di chuyển thẻ</div>
              </div>
            </div>
            {currentLockType === ColumnLockType.UNLOCKED && (
              <Check className="w-3.5 h-3.5 text-indigo-400" />
            )}
          </button>

          <button
            onClick={() => onSelectLockType(ColumnLockType.ONE_WAY_LOCKED)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700/60 hover:text-white transition-colors text-left">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="w-3.5 h-3.5 text-amber-500" />
              <div>
                <div className="font-medium text-amber-400">Khóa 1 chiều</div>
                <div className="text-[10px] text-slate-400">
                  Chỉ kéo vào, không kéo ra
                </div>
              </div>
            </div>
            {currentLockType === ColumnLockType.ONE_WAY_LOCKED && (
              <Check className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>

          <button
            onClick={() => onSelectLockType(ColumnLockType.FULLY_LOCKED)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700/60 hover:text-white transition-colors text-left">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-red-500" />
              <div>
                <div className="font-medium text-red-400">Khóa hoàn toàn</div>
                <div className="text-[10px] text-slate-400">
                  Chặn mọi thao tác kéo thả
                </div>
              </div>
            </div>
            {currentLockType === ColumnLockType.FULLY_LOCKED && (
              <Check className="w-3.5 h-3.5 text-red-400" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
