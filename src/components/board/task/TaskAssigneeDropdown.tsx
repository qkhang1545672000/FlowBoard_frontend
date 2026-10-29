"use client";

import React, { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { TaskMember } from "@/types/column";

interface Member {
  id: string;
  name: string;
  avatar?: string;
}

interface TaskAssigneeDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  members: TaskMember[];
  currentAssignee?: string;
  onSelect: (memberId: string) => void;
  coords: { top: number; left: number }; // Nhận tọa độ vị trí nút bấm
}

export function TaskAssigneeDropdown({
  isOpen,
  onClose,
  members,
  currentAssignee,
  onSelect,
  coords,
}: TaskAssigneeDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
      className="fixed z-[99999] w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 text-xs text-slate-200">
      <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
        Phân công thành viên
      </div>
      <div className="max-h-40 overflow-y-auto space-y-1">
        {members.map((member) => {
          const isSelected = currentAssignee === member.user.name;
          return (
            <button
              key={member.id}
              type="button"
              onClick={() => {
                onSelect(member.user.id);
                onClose();
              }}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-left ${
                isSelected
                  ? "bg-indigo-600/20 text-indigo-400 font-medium"
                  : "hover:bg-slate-800 text-slate-300"
              }`}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-300 font-bold">
                  {member.user.name.charAt(0)}
                </div>
                <span className="truncate">{member.user.name}</span>
              </div>
              {isSelected && <Check className="w-3.5 h-3.5" />}
            </button>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}
