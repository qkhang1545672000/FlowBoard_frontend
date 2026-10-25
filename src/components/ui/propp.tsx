/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { addDays, format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  X,
  Check,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TaskDateRangePopoverProps {
  startDate?: string | null;
  dueDate?: string | null;
  onUpdateDates: (startDate: string | null, dueDate: string | null) => void;
}

// Format chuẩn ISO cho datetime-local input (YYYY-MM-DDTHH:mm:ss)
const formatToDatetimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export function TaskDateRangePopover({
  startDate,
  dueDate,
  onUpdateDates,
}: TaskDateRangePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  // Khoảng ngày (Mặc định: Hôm nay -> Ngày mai)
  const [range, setRange] = useState<DateRange | undefined>(() => ({
    from: startDate ? new Date(startDate) : new Date(),
    to: dueDate ? new Date(dueDate) : addDays(new Date(), 1),
  }));

  const [startDateTime, setStartDateTime] = useState<string>(() =>
    formatToDatetimeLocal(startDate ? new Date(startDate) : new Date()),
  );
  const [endDateTime, setEndDateTime] = useState<string>(() =>
    formatToDatetimeLocal(dueDate ? new Date(dueDate) : addDays(new Date(), 1)),
  );

  useEffect(() => {
    setRange({
      from: startDate ? new Date(startDate) : new Date(),
      to: dueDate ? new Date(dueDate) : addDays(new Date(), 1),
    });
    if (startDate) {
      setStartDateTime(formatToDatetimeLocal(new Date(startDate)));
    }
    if (dueDate) {
      setEndDateTime(formatToDatetimeLocal(new Date(dueDate)));
    }
  }, [startDate, dueDate]);

  // Lắng nghe sự kiện click ngoài bảng lịch để chỉ đóng lịch, giữ nguyên modal lớn
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isCalendarOpen &&
        calendarContainerRef.current &&
        !calendarContainerRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

  const handleSave = () => {
    let finalStart: string | null = null;
    let finalEnd: string | null = null;

    if (range?.from && startDateTime) {
      const timePart = startDateTime.split("T")[1] || "00:00:00";
      const [h, m, s] = timePart.split(":");
      const d = new Date(range.from);
      d.setHours(parseInt(h, 10), parseInt(m, 10), parseInt(s || "0", 10), 0);
      finalStart = d.toISOString();
    }

    if (range?.to && endDateTime) {
      const timePart = endDateTime.split("T")[1] || "00:00:00";
      const [h, m, s] = timePart.split(":");
      const d = new Date(range.to);
      d.setHours(parseInt(h, 10), parseInt(m, 10), parseInt(s || "0", 10), 0);
      finalEnd = d.toISOString();
    } else if (range?.from && endDateTime) {
      const timePart = endDateTime.split("T")[1] || "00:00:00";
      const [h, m, s] = timePart.split(":");
      const d = new Date(range.from);
      d.setHours(parseInt(h, 10), parseInt(m, 10), parseInt(s || "0", 10), 0);
      finalEnd = d.toISOString();
    }

    onUpdateDates(finalStart, finalEnd);
    setIsOpen(false);
  };

  const handleClear = () => {
    setRange(undefined);
    onUpdateDates(null, null);
    setIsOpen(false);
  };

  // Helper render ô nhập giờ thân thiện với người dùng
  const renderTimeInput = (
    label: string,
    dateTimeStr: string,
    setDateTimeStr: (val: string) => void,
  ) => {
    const timeValue = dateTimeStr.split("T")[1] || "07:16:00";

    return (
      <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 shadow-inner">
        <label className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
          <Clock className="w-3 h-3 text-indigo-400" /> {label}
        </label>
        <div className="relative flex items-center justify-center bg-slate-900 border border-slate-700/60 hover:border-indigo-500/50 rounded-lg px-3 py-2 transition-colors">
          <input
            type="time"
            step="1"
            value={timeValue}
            onChange={(e) => {
              const newTime = e.target.value;
              const datePart =
                dateTimeStr.split("T")[0] ||
                formatToDatetimeLocal(new Date()).split("T")[0];
              const formattedTime = newTime.length === 5 ? `${newTime}:00` : newTime;
              setDateTimeStr(`${datePart}T${formattedTime}`);
            }}
            className="bg-transparent text-slate-100 font-mono text-sm font-bold focus:outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden text-center cursor-pointer w-full"
          />
        </div>
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      {/* Nút mở popover trên TaskCard */}
      <PopoverTrigger
        type="button"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="p-1 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 rounded-lg transition-colors flex items-center gap-1 text-[10px]"
        title="Cài đặt thời gian">
        <CalendarIcon className="w-3.5 h-3.5 ml-1 text-indigo-400" />
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        className="w-[340px] p-4 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-slate-100 shadow-2xl rounded-2xl z-[99999] space-y-4"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}>
        {/* Header thân thiện */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Cài đặt thời gian Task</h4>
              <p className="text-[10px] text-slate-400">
                Chọn khoảng ngày và khung giờ thực hiện
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ô chọn khoảng ngày trực quan */}
        <div className="space-y-1.5 relative" ref={calendarContainerRef}>
          <label className="text-[11px] font-semibold text-slate-300 block">
            Khoảng thời gian (Ngày)
          </label>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCalendarOpen((prev) => !prev);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 flex items-center justify-between cursor-pointer transition-all shadow-sm group">
            <div className="flex items-center gap-2.5 truncate">
              <CalendarIcon className="w-4 h-4 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate font-medium">
                {range?.from ? (
                  range.to ? (
                    <span className="flex items-center gap-1.5">
                      {format(range.from, "MMM dd, yyyy")}
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      {format(range.to, "MMM dd, yyyy")}
                    </span>
                  ) : (
                    format(range.from, "MMM dd, yyyy")
                  )
                ) : (
                  <span className="text-slate-500">Chọn khoảng ngày...</span>
                )}
              </span>
            </div>
          </button>

          {/* Bảng lịch 1 tháng hiển thị độc lập khi bấm, click ra ngoài chỉ đóng lịch */}
          {isCalendarOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute left-0 top-full mt-2 z-[999999] p-3 bg-slate-900 border border-slate-700 text-slate-100 shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="rounded-xl bg-slate-950/60 p-2 border border-slate-800/80">
                <Calendar
                  mode="range"
                  defaultMonth={range?.from}
                  selected={range}
                  onSelect={setRange}
                  numberOfMonths={1}
                  className="text-slate-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* Ô nhập Giờ bắt đầu & Giờ hết hạn cân đối */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {renderTimeInput("Bắt đầu", startDateTime, setStartDateTime)}
          {renderTimeInput("Hết hạn", endDateTime, setEndDateTime)}
        </div>

        {/* Footer Actions tinh tế */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 bg-slate-800/60 hover:bg-red-500/15 text-red-400 hover:text-red-300 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 border border-slate-700/50">
            <RotateCcw className="w-3.5 h-3.5" /> Xóa lịch
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 active:scale-95">
            <Check className="w-3.5 h-3.5" /> Lưu cài đặt
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
