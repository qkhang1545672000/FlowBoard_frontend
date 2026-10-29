/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Clock, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const periods = ["AM", "PM"];

interface TimePickerDropdownProps {
  label: string;
  timeState: { hour: string; minute: string; period: string };
  onChangeTime: (updated: { hour: string; minute: string; period: string }) => void;
}

export function TimePickerDropdown({
  label,
  timeState,
  onChangeTime,
}: TimePickerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempTime, setTempTime] = useState(timeState);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 🟢 Tạo các ref lưu trữ vị trí của các nút đang được chọn trong từng cột
  const selectedHourRef = useRef<HTMLButtonElement>(null);
  const selectedMinuteRef = useRef<HTMLButtonElement>(null);
  const selectedPeriodRef = useRef<HTMLButtonElement>(null);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      setTempTime(timeState); // Đồng bộ giá trị hiện tại vào biến tạm khi mở
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }
    setIsOpen(!isOpen);
  };

  // 🟢 Tự động cuộn đến vị trí đang chọn ngay khi dropdown mở ra
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        selectedHourRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        selectedMinuteRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        selectedPeriodRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const columns = [
    {
      label: "Hour",
      options: hours,
      value: tempTime.hour,
      key: "hour" as const,
      selectedRef: selectedHourRef,
    },
    {
      label: "Minute",
      options: minutes,
      value: tempTime.minute,
      key: "minute" as const,
      selectedRef: selectedMinuteRef,
    },
    {
      label: "Period",
      options: periods,
      value: tempTime.period,
      key: "period" as const,
      selectedRef: selectedPeriodRef,
    },
  ];

  return (
    <div className="space-y-1 relative">
      <label className="text-[10px] font-medium text-indigo-400 flex items-center gap-1">
        <Clock className="w-3 h-3" /> {label}
      </label>

      {/* Nút kích hoạt mở/đóng dropdown chọn giờ */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        className="w-[105px] h-8 px-3 inline-flex items-center rounded-lg border text-xs font-normal bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 cursor-pointer select-none transition-colors">
        <Clock className="w-3.5 h-3.5 text-muted-foreground mr-1 shrink-0" />
        <span className="tabular-nums">
          {timeState.hour}:{timeState.minute} {timeState.period}
        </span>
      </button>

      {/* Dropdown hiển thị qua Portal để phủ toàn màn hình tuyệt đối */}
      {isOpen &&
        coords &&
        typeof window !== "undefined" &&
        ReactDOM.createPortal(
          <>
            {/* Lớp overlay vô hình phủ toàn màn hình: Bấm ra ngoài chỉ đóng dropdown, không lưu và giữ nguyên modal cha */}
            <div
              className="fixed inset-0 z-[99998] bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsOpen(false);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            />

            {/* Khung chứa các cột chọn giờ */}
            <div
              style={{
                top: coords.top + 4,
                left: coords.left,
              }}
              className="absolute z-[99999] w-auto p-0 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}>
              <div className="flex divide-x divide-slate-800">
                {columns.map((column) => (
                  <div key={column.label} className="flex flex-col">
                    <span className="border-b border-slate-800 px-3 py-1.5 text-center text-xs font-medium text-slate-400">
                      {column.label}
                    </span>
                    <ScrollArea className="h-44">
                      <div
                        role="listbox"
                        aria-label={column.label}
                        className="flex flex-col gap-1 p-1.5">
                        {column.options.map((option) => {
                          const selected = option === column.value;
                          return (
                            <button
                              key={option}
                              ref={selected ? column.selectedRef : null} // 🟢 Gán ref cho nút đang được chọn
                              type="button"
                              role="option"
                              aria-selected={selected}
                              className={cn(
                                "w-12 cursor-pointer tabular-nums text-xs h-7 rounded-md inline-flex items-center justify-center transition-colors",
                                selected
                                  ? "bg-indigo-600 text-white font-medium"
                                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800",
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                // Chỉ lưu vào biến tạm khi chọn, chưa gọi onChangeTime chính thức
                                setTempTime((prev) => ({
                                  ...prev,
                                  [column.key]: option,
                                }));
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}>
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                ))}
              </div>

              {/* Nút xác nhận "Xong": Lưu giá trị tạm vào state chính và đóng dropdown */}
              <div className="border-t border-slate-800 p-1.5 bg-slate-950/50 flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onChangeTime(tempTime); // Xác nhận lưu dữ liệu thật tại đây
                    setIsOpen(false);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-md font-medium inline-flex items-center gap-1 cursor-pointer">
                  <Check className="w-3 h-3" /> Xong
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
