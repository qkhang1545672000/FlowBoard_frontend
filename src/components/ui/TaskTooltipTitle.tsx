import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";

interface Props {
  title: React.ReactNode; // 🟢 Cho phép nhận cả string, số hoặc các thẻ JSX (ReactNode)
  className?: string;
}

export function TaskTooltipTitle({ title, className = "" }: Props) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 8, // Hiển thị phía trên tiêu đề một chút
        left: rect.left,
      });
    }
  };

  const handleMouseLeave = () => {
    setCoords(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center min-w-0 max-w-[220px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      {/* Tiêu đề hiển thị (lưu ý:truncate hoạt động tốt nhất khi title là string) */}
      <div
        className={`text-xs font-medium text-slate-100 truncate cursor-pointer ${className}`}>
        {title}
      </div>

      {/* Sử dụng createPortal để render tooltip thẳng ra document.body */}
      {coords &&
        createPortal(
          <div
            style={{
              top: `${coords.top}px`,
              left: `${Math.min(coords.left, window.innerWidth - 270)}px`,
              transform: "translateY(-100%)",
            }}
            className="fixed z-[999999] w-64 p-2.5 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl text-xs text-slate-100 whitespace-normal break-words pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            <div className="font-semibold text-slate-400 text-[10px] mb-1">
              Nội dung đầy đủ:
            </div>
            {title}
          </div>,
          document.body,
        )}
    </div>
  );
}
