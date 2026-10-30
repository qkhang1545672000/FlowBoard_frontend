/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef } from "react";
import { createPortal } from "react-dom";
import { Flame, Zap, ChevronDown } from "lucide-react";
import { TaskPriority } from "@/types";
import { useUpdateTask } from "@/hooks/useTask";
import { useBoardStore } from "@/store/useBoardStore";

interface TaskPriorityDropdownProps {
  priority: TaskPriority;
  taskId: string;
  onUpdatePriority?: (priority: TaskPriority) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TaskPriorityDropdown({
  priority,
  taskId,
  onUpdatePriority,
  isOpen: propIsOpen,
  onOpenChange: propOnOpenChange,
}: TaskPriorityDropdownProps) {
  const [stateIsOpen, setStateIsOpen] = React.useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : stateIsOpen;
  const setIsOpen = (val: boolean) => {
    setStateIsOpen(val);
    propOnOpenChange?.(val);
  };

  const [menuPosition, setMenuPosition] = React.useState<{
    top: number;
    left: number;
    placement: "left" | "right" | "top";
  } | null>(null);
  const boardId = useBoardStore((state) => state.activeBoardId) ?? "";
  const priorityBtnRef = useRef<HTMLButtonElement>(null);

  const { mutate: updateTaskPriority } = useUpdateTask(boardId);
  const getPriorityConfig = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.URGENT:
        return {
          style:
            "bg-red-500/20 text-red-400 border-red-500/40 shadow-lg shadow-red-500/10 animate-pulse",
          icon: <Flame className="w-3 h-3 text-red-500" />,
          label: TaskPriority.URGENT,
        };
      case TaskPriority.HIGH:
        return {
          style: "bg-orange-500/20 text-orange-400 border-orange-500/30",
          icon: <Zap className="w-3 h-3 text-orange-400" />,
          label: TaskPriority.HIGH,
        };
      case TaskPriority.MEDIUM:
        return {
          style: "bg-amber-500/20 text-amber-400 border-amber-500/30",
          icon: null,
          label: TaskPriority.MEDIUM,
        };
      case TaskPriority.LOW:
      default:
        return {
          style: "bg-slate-700/50 text-slate-300 border-slate-600/30",
          icon: null,
          label: TaskPriority.LOW,
        };
    }
  };

  const priorityConfig = getPriorityConfig(priority);

  const priorityOptions = [
    {
      value: TaskPriority.URGENT,
      label: TaskPriority.URGENT,
      color: "text-red-400 hover:bg-red-500/10",
      icon: <Flame className="w-3 h-3 text-red-500" />,
    },
    {
      value: TaskPriority.HIGH,
      label: TaskPriority.HIGH,
      color: "text-orange-400 hover:bg-orange-500/10",
      icon: <Zap className="w-3 h-3 text-orange-400" />,
    },
    {
      value: TaskPriority.MEDIUM,
      label: TaskPriority.MEDIUM,
      color: "text-amber-400 hover:bg-amber-500/10",
      icon: null,
    },
    {
      value: TaskPriority.LOW,
      label: TaskPriority.LOW,
      color: "text-slate-300 hover:bg-slate-700/50",
      icon: null,
    },
  ];

  const handleToggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!isOpen && priorityBtnRef.current) {
      const rect = priorityBtnRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const menuWidth = 140;

      let left = rect.left + window.scrollX;
      let top = rect.bottom + window.scrollY + 4;
      let placement: "left" | "right" | "top" = "left";

      const spaceOnLeft = rect.left;
      const spaceOnRight = screenWidth - rect.right;

      if (spaceOnLeft < menuWidth && spaceOnRight < menuWidth) {
        left = rect.left + window.scrollX + rect.width / 2 - menuWidth / 2;
        top = rect.top + window.scrollY - 180;
        placement = "top";
      } else if (spaceOnLeft < menuWidth && spaceOnRight >= menuWidth) {
        left = rect.left + window.scrollX;
        placement = "right";
      } else if (spaceOnRight < menuWidth && spaceOnLeft >= menuWidth) {
        left = rect.right + window.scrollX - menuWidth;
        placement = "left";
      } else {
        left = rect.right + window.scrollX - menuWidth;
        placement = "left";
      }

      setMenuPosition({ top, left, placement });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button
        ref={priorityBtnRef}
        type="button"
        onClick={handleToggleMenu}
        onMouseDown={(e) => e.stopPropagation()}
        className={`px-2 py-0.5 text-[10px] font-semibold rounded border flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-80 ${priorityConfig.style}`}
        title="Bấm để đổi trạng thái">
        {priorityConfig.icon}
        <span>{priorityConfig.label}</span>
        <ChevronDown className="w-3 h-3 opacity-70" />
      </button>

      {isOpen &&
        menuPosition &&
        typeof window !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998]"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              onMouseDown={(e) => e.stopPropagation()}
            />
            <div
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
                minWidth: "140px",
              }}
              className="absolute z-[9999] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 text-xs max-h-40 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}>
              <div className="px-3 py-1 text-[10px] font-medium text-slate-400 border-b border-slate-800 mb-1 sticky top-0 bg-slate-900">
                Mức ưu tiên
              </div>
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTaskPriority({ taskId, priority: opt.value });
                    if (onUpdatePriority) {
                      onUpdatePriority(opt.value);
                    }
                    // 🟢 Dùng setTimeout nhỏ để nhường luồng render cho TaskCard cập nhật lại trạng thái chuột
                    setTimeout(() => {
                      setIsOpen(false);
                    }, 50);
                  }}
                  className={`w-full text-left px-3 py-1.5 flex items-center gap-2 font-medium transition-colors ${opt.color} ${
                    priority === opt.value ? "bg-slate-800/80 font-bold" : ""
                  }`}>
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
