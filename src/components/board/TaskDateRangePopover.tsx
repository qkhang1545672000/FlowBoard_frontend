/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { addDays } from "date-fns";
import { Calendar as CalendarIcon, RotateCcw } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePickerDropdown } from "./TimePickerDropdown";

interface TaskDateRangePopoverProps {
  startDate?: string | null;
  dueDate?: string | null;
  onUpdateDates: (startDate: string | null, dueDate: string | null) => void;
}

export function TaskDateRangePopover({
  startDate,
  dueDate,
  onUpdateDates,
}: TaskDateRangePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [showAdvancedTime, setShowAdvancedTime] = useState<boolean>(() => {
    if (!startDate && !dueDate) return false;
    const hasCustomStart = startDate
      ? new Date(startDate).getHours() !== 0 || new Date(startDate).getMinutes() !== 0
      : false;
    const hasCustomDue = dueDate
      ? new Date(dueDate).getHours() !== 23 || new Date(dueDate).getMinutes() !== 59
      : false;
    return hasCustomStart || hasCustomDue;
  });

  const [range, setRange] = useState<DateRange | undefined>(() => ({
    from: startDate ? new Date(startDate) : new Date(),
    to: dueDate ? new Date(dueDate) : addDays(new Date(), 1),
  }));

  const parseDateToTime12 = (dateObj: Date) => {
    const h24 = dateObj.getHours();
    const m = dateObj.getMinutes();
    const periodVal = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    const roundedM = Math.round(m / 5) * 5;
    const finalM = roundedM === 60 ? 50 : roundedM;
    return {
      hour: String(h12).padStart(2, "0"),
      minute: String(finalM).padStart(2, "0"),
      period: periodVal,
    };
  };

  const [startTimeObj, setStartTimeObj] = useState(() =>
    parseDateToTime12(startDate ? new Date(startDate) : new Date()),
  );
  const [endTimeObj, setEndTimeObj] = useState(() =>
    parseDateToTime12(dueDate ? new Date(dueDate) : addDays(new Date(), 1)),
  );

  useEffect(() => {
    setRange({
      from: startDate ? new Date(startDate) : new Date(),
      to: dueDate ? new Date(dueDate) : addDays(new Date(), 1),
    });
    if (startDate) {
      setStartTimeObj(parseDateToTime12(new Date(startDate)));
    }
    if (dueDate) {
      setEndTimeObj(parseDateToTime12(new Date(dueDate)));
    }
  }, [startDate, dueDate]);

  const convertTo24Hour = (hourStr: string, minuteStr: string, periodStr: string) => {
    let h = parseInt(hourStr, 10);
    const m = parseInt(minuteStr, 10);
    if (periodStr === "PM" && h < 12) h += 12;
    if (periodStr === "AM" && h === 12) h = 0;
    return { h, m };
  };

  const triggerUpdate = (
    newRange: DateRange | undefined,
    startObj: { hour: string; minute: string; period: string },
    endObj: { hour: string; minute: string; period: string },
    isAdvanced: boolean,
  ) => {
    let finalStart: string | null = null;
    let finalEnd: string | null = null;

    if (newRange?.from) {
      const d = new Date(newRange.from);
      if (isAdvanced) {
        const { h, m } = convertTo24Hour(startObj.hour, startObj.minute, startObj.period);
        d.setHours(h, m, 0, 0);
      } else {
        d.setHours(0, 0, 0, 0);
      }
      finalStart = d.toISOString();
    }

    if (newRange?.to) {
      const d = new Date(newRange.to);
      if (isAdvanced) {
        const { h, m } = convertTo24Hour(endObj.hour, endObj.minute, endObj.period);
        d.setHours(h, m, 0, 0);
      } else {
        d.setHours(23, 59, 59, 999);
      }
      finalEnd = d.toISOString();
    } else if (newRange?.from) {
      const d = new Date(newRange.from);
      if (isAdvanced) {
        const { h, m } = convertTo24Hour(endObj.hour, endObj.minute, endObj.period);
        d.setHours(h, m, 0, 0);
      } else {
        d.setHours(23, 59, 59, 999);
      }
      finalEnd = d.toISOString();
    }

    onUpdateDates(finalStart, finalEnd);
  };

  const handleSelectCalendar = (selectedRange: DateRange | undefined) => {
    setRange(selectedRange);
    triggerUpdate(selectedRange, startTimeObj, endTimeObj, showAdvancedTime);
  };

  const handleToggleAdvanced = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setShowAdvancedTime(checked);
    triggerUpdate(range, startTimeObj, endTimeObj, checked);
  };

  const handleResetToDefault = () => {
    const defaultFrom = new Date();
    const defaultTo = addDays(new Date(), 1);
    const defStart = { hour: "08", minute: "00", period: "AM" };
    const defEnd = { hour: "05", minute: "00", period: "PM" };

    setRange({ from: defaultFrom, to: defaultTo });
    setStartTimeObj(defStart);
    setEndTimeObj(defEnd);
    setShowAdvancedTime(false);

    triggerUpdate({ from: defaultFrom, to: defaultTo }, defStart, defEnd, false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="p-1 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 rounded-lg transition-colors flex items-center gap-1 text-[10px]"
        title="Cài đặt thời gian">
        <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
      </PopoverTrigger>

      <PopoverContent
        className={`absolute top-[-200px] left-[49px] p-3 bg-slate-900 border border-slate-700 text-slate-100 shadow-xl rounded-xl z-[99999] transition-all duration-200 ${
          showAdvancedTime ? "w-[430px]" : "w-[300px]"
        }`}
        align="start"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}>
        {/* Bố cục chính */}
        <div className="flex gap-2 items-start">
          {/* Bảng lịch */}
          <div className="rounded-lg bg-slate-950/40 border border-slate-800/80 shrink-0 p-1">
            <Calendar
              mode="range"
              defaultMonth={range?.from}
              selected={range}
              onSelect={handleSelectCalendar}
              numberOfMonths={1}
              className="text-slate-100 scale-95 origin-top-left"
              classNames={{
                range_start:
                  "bg-indigo-600 text-white !rounded-l-xl !rounded-r-xl relative z-10",
                range_end:
                  "bg-indigo-600 text-white !rounded-l-xl !rounded-r-xl relative z-10",
                range_middle: "bg-slate-800/80 text-slate-200 rounded-none",
                selected:
                  "bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white focus:bg-indigo-600 focus:text-white rounded-xl",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-800 rounded-lg transition-colors",
              }}
            />
          </div>

          {/* Ô chọn giờ nâng cao dạng cuộn */}
          {showAdvancedTime && (
            <div className="flex flex-col gap-2 flex-1 justify-center h-full pt-1">
              <div className="space-y-2 w-[121px] bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 shadow-inner">
                <TimePickerDropdown
                  label="Bắt đầu"
                  timeState={startTimeObj}
                  onChangeTime={(updated) => {
                    setStartTimeObj(updated);
                    triggerUpdate(range, updated, endTimeObj, showAdvancedTime);
                  }}
                />
                <TimePickerDropdown
                  label="Hết hạn"
                  timeState={endTimeObj}
                  onChangeTime={(updated) => {
                    setEndTimeObj(updated);
                    triggerUpdate(range, startTimeObj, updated, showAdvancedTime);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Thanh Footer thu gọn */}
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-300 hover:text-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={showAdvancedTime}
              onChange={handleToggleAdvanced}
              className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-[11px] font-medium">Chọn giờ</span>
          </label>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-1 border border-slate-700/50"
            title="Về mặc định">
            <RotateCcw className="w-3 h-3 text-indigo-400" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
