"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TaskDueDatePopoverProps {
  dueDate?: string | Date | null;
  onUpdateDueDate: (newIsoDate: string) => void;
}

export function TaskDueDatePopover({
  dueDate,
  onUpdateDueDate,
}: TaskDueDatePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = dueDate ? new Date(dueDate) : undefined;

  const [hour, setHour] = useState<string>(
    selectedDate ? format(selectedDate, "hh") : "11",
  );
  const [minute, setMinute] = useState<string>(
    selectedDate ? format(selectedDate, "mm") : "59",
  );
  const [ampm, setAmpm] = useState<string>(
    selectedDate ? format(selectedDate, "a") : "PM",
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    updateDateTime(date, hour, minute, ampm);
  };

  const handleTimeChange = (newH: string, newM: string, newA: string) => {
    setHour(newH);
    setMinute(newM);
    setAmpm(newA);

    const targetDate = selectedDate ? new Date(selectedDate) : new Date();
    updateDateTime(targetDate, newH, newM, newA);
  };

  const updateDateTime = (baseDate: Date, hStr: string, mStr: string, aStr: string) => {
    let hours = parseInt(hStr, 10);
    const minutes = parseInt(mStr, 10);

    if (aStr === "PM" && hours < 12) hours += 12;
    if (aStr === "AM" && hours === 12) hours = 0;

    baseDate.setHours(hours, minutes, 0, 0);
    onUpdateDueDate(baseDate.toISOString());
  };

  const minutesList = ["00", "15", "30", "45"];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      {/* KHÔNG DÙNG asChild KHI TRUYỀN THỰC THỂ BUTTON TRỰC TIẾP */}
      <PopoverTrigger className="p-1 bg-slate-700/60 hover:bg-slate-700 text-sky-400 rounded transition-all cursor-pointer inline-flex items-center justify-center">
        <CalendarIcon className="w-3 h-3" />
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-3 bg-slate-900 border border-slate-700 text-slate-100 shadow-2xl z-[9999] space-y-2.5 rounded-xl text-xs"
        align="start">
        {/* Header có tiêu đề và nút X tắt */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="font-semibold text-slate-200">Chọn hạn chót</span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lịch thu gọn */}
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          defaultMonth={selectedDate}
        />

        {/* Thanh chọn giờ nằm ngang siêu gọn */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1 text-slate-400 font-medium">
            <Clock className="w-3 h-3 text-indigo-400" />
            <span>Giờ:</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Chọn nhanh Giờ */}
            <select
              value={hour}
              onChange={(e) => handleTimeChange(e.target.value, minute, ampm)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-1.5 py-1 text-xs outline-none focus:border-indigo-500 cursor-pointer">
              {[
                "01",
                "02",
                "03",
                "04",
                "05",
                "06",
                "07",
                "08",
                "09",
                "10",
                "11",
                "12",
              ].map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            <span className="text-slate-500 font-bold">:</span>

            {/* Chọn nhanh Phút */}
            <select
              value={minute}
              onChange={(e) => handleTimeChange(hour, e.target.value, ampm)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-1.5 py-1 text-xs outline-none focus:border-indigo-500 cursor-pointer">
              {minutesList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Chọn AM/PM */}
            <select
              value={ampm}
              onChange={(e) => handleTimeChange(hour, minute, e.target.value)}
              className="bg-slate-800 border border-slate-700 text-indigo-400 font-semibold rounded px-1.5 py-1 text-xs outline-none focus:border-indigo-500 cursor-pointer">
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
