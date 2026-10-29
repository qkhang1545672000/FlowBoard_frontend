"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Clock, X, Check } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface TaskSubtaskDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  startDate?: string | null;
  dueDate?: string | null;
  taskStartDate?: string | null;
  taskDueDate?: string | null;
  onSave: (startDate: string | null, dueDate: string | null) => void;
}

const parseDateSafe = (dateStr?: string | null) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return new Date(dateStr);
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export function TaskSubtaskDatePicker({
  isOpen,
  onClose,
  startDate,
  dueDate,
  taskStartDate,
  taskDueDate,
  onSave,
}: TaskSubtaskDatePickerProps) {
  const [range, setRange] = useState<DateRange | undefined>(() => ({
    from: startDate ? parseDateSafe(startDate) || new Date() : new Date(),
    to: dueDate ? parseDateSafe(dueDate) || undefined : undefined,
  }));

  const [startTime, setStartTime] = useState<string>(() => {
    const d = startDate ? parseDateSafe(startDate) || new Date() : new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });

  const [endTime, setEndTime] = useState<string>(() => {
    const d = dueDate ? parseDateSafe(dueDate) || new Date() : new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });

  const [activeTab, setActiveTab] = useState<"start" | "end">("start");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (startDate || dueDate) {
      setRange({
        from: startDate ? parseDateSafe(startDate) || new Date() : new Date(),
        to: dueDate ? parseDateSafe(dueDate) || undefined : undefined,
      });
      if (startDate) {
        const d = parseDateSafe(startDate);
        if (d)
          setStartTime(
            `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
          );
      }
      if (dueDate) {
        const d = parseDateSafe(dueDate);
        if (d)
          setEndTime(
            `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
          );
      }
    } else {
      setRange({ from: new Date(), to: undefined });
    }
    setErrorMsg(null);
  }, [startDate, dueDate, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        selectedButtonRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab, startTime, endTime]);

  if (!isOpen) return null;

  const getNormalizedTaskLimits = () => {
    const minLimit = parseDateSafe(taskStartDate);
    const maxLimit = parseDateSafe(taskDueDate);

    if (
      maxLimit &&
      maxLimit.getHours() === 0 &&
      maxLimit.getMinutes() === 0 &&
      maxLimit.getSeconds() === 0
    ) {
      maxLimit.setHours(23, 59, 0, 0);
    }
    return { minLimit, maxLimit };
  };

  const timeSlots = Array.from({ length: 1440 }, (_, i) => {
    const hour = Math.floor(i / 60);
    const minute = i % 60;
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  });

  const isTimeSlotDisabled = (timeStr: string, type: "start" | "end") => {
    const activeDate = type === "start" ? range?.from : range?.to || range?.from;
    if (!activeDate) return true;

    const [h, m] = timeStr.split(":").map(Number);
    const candidateMinutes = h * 60 + m;

    const { minLimit, maxLimit } = getNormalizedTaskLimits();

    if (minLimit && activeDate.toDateString() === minLimit.toDateString()) {
      const minMinutes = minLimit.getHours() * 60 + minLimit.getMinutes();
      if (candidateMinutes < minMinutes) return true;
    }
    if (maxLimit && activeDate.toDateString() === maxLimit.toDateString()) {
      const maxMinutes = maxLimit.getHours() * 60 + maxLimit.getMinutes();
      if (candidateMinutes > maxMinutes) return true;
    }

    const effectiveTo = range?.to || range?.from;
    const isSameDay =
      range?.from &&
      effectiveTo &&
      new Date(range.from).toDateString() === new Date(effectiveTo).toDateString();

    if (isSameDay) {
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);

      if (type === "start") {
        const endMinutes = endH * 60 + endM;
        if (candidateMinutes > endMinutes) return true;
      } else {
        const startMinutes = startH * 60 + startM;
        if (candidateMinutes < startMinutes) return true;
      }
    }

    return false;
  };

  const handleSave = () => {
    setErrorMsg(null);
    if (!range?.from) {
      setErrorMsg("Vui lòng chọn ngày bắt đầu!");
      return;
    }

    const [startH, startM] = startTime.split(":").map(Number);
    const finalStart = new Date(range.from);
    finalStart.setHours(startH || 0, startM || 0, 0, 0);

    const targetTo = range.to || range.from;
    const [endH, endM] = endTime.split(":").map(Number);
    const finalEnd = new Date(targetTo);
    finalEnd.setHours(!isNaN(endH) ? endH : 23, !isNaN(endM) ? endM : 59, 0, 0);

    const { minLimit, maxLimit } = getNormalizedTaskLimits();

    if (minLimit && finalStart.toDateString() === minLimit.toDateString()) {
      const startMin = startH * 60 + startM;
      const minLimitMin = minLimit.getHours() * 60 + minLimit.getMinutes();
      if (startMin < minLimitMin) {
        setErrorMsg(
          `Ngày bắt đầu không được trước Task cha (${new Date(taskStartDate!).toLocaleString("vi-VN")})`,
        );
        return;
      }
    }

    if (maxLimit && finalEnd.toDateString() === maxLimit.toDateString()) {
      const endMin = endH * 60 + endM;
      const maxLimitMin = maxLimit.getHours() * 60 + maxLimit.getMinutes();
      if (endMin > maxLimitMin) {
        setErrorMsg(
          `Deadline không được vượt quá Task cha (${new Date(taskDueDate!).toLocaleString("vi-VN")})`,
        );
        return;
      }
    }

    if (minLimit) {
      const startDayOnly = new Date(
        finalStart.getFullYear(),
        finalStart.getMonth(),
        finalStart.getDate(),
      );
      const minDayOnly = new Date(
        minLimit.getFullYear(),
        minLimit.getMonth(),
        minLimit.getDate(),
      );
      if (startDayOnly < minDayOnly) {
        setErrorMsg(
          `Ngày bắt đầu không được trước Task cha (${new Date(taskStartDate!).toLocaleString("vi-VN")})`,
        );
        return;
      }
    }

    if (maxLimit) {
      const endDayOnly = new Date(
        finalEnd.getFullYear(),
        finalEnd.getMonth(),
        finalEnd.getDate(),
      );
      const maxDayOnly = new Date(
        maxLimit.getFullYear(),
        maxLimit.getMonth(),
        maxLimit.getDate(),
      );
      if (endDayOnly > maxDayOnly) {
        setErrorMsg(
          `Deadline không được vượt quá Task cha (${new Date(taskDueDate!).toLocaleString("vi-VN")})`,
        );
        return;
      }
    }

    const startTotalMin = finalStart.getTime();
    const endTotalMin = finalEnd.getTime();
    if (startTotalMin > endTotalMin) {
      setErrorMsg("Thời gian bắt đầu không được lớn hơn hạn chót!");
      return;
    }

    onSave(finalStart.toISOString(), finalEnd.toISOString());
    onClose();
  };

  const handleClear = () => {
    setErrorMsg(null);
    setRange(undefined);
    onSave(null, null);
    onClose();
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[99998] bg-slate-950/70 backdrop-blur-xs"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto bg-slate-900 border border-slate-700/80 rounded-2xl w-[560px] shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-indigo-400">
              <Clock className="w-4 h-4" /> Khoảng thời gian công việc con
            </h4>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <div className="mx-5 mt-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-2.5 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div className="relative flex flex-col sm:flex-row p-5 gap-5">
            <div className="flex justify-center flex-1">
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
                defaultMonth={range?.from}
                disabled={(date) => {
                  const { minLimit, maxLimit } = getNormalizedTaskLimits();
                  if (minLimit) {
                    const minD = new Date(minLimit);
                    minD.setHours(0, 0, 0, 0);
                    if (date < minD) return true;
                  }
                  if (maxLimit) {
                    const maxD = new Date(maxLimit);
                    maxD.setHours(23, 59, 0, 0);
                    if (date > maxD) return true;
                  }
                  return false;
                }}
                classNames={{
                  day_range_start:
                    "bg-indigo-600 text-white rounded-l-xl rounded-r-none relative z-10 font-bold",
                  day_range_end:
                    "bg-indigo-600 text-white rounded-r-xl rounded-l-none relative z-10 font-bold",
                  day_range_middle: "bg-slate-800/80 text-slate-200 rounded-none",
                  day_selected: "bg-indigo-600 text-white rounded-xl",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-xl",
                }}
                className="bg-transparent p-0 text-sm text-slate-200"
              />
            </div>

            <div className="w-full sm:w-44 border-t sm:border-t-0 sm:border-l border-slate-800 pl-0 sm:pl-5 flex flex-col">
              <div className="flex items-center bg-slate-950/60 p-1 rounded-xl mb-3 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab("start")}
                  className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-all ${
                    activeTab === "start"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}>
                  Bắt đầu
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("end")}
                  className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-all ${
                    activeTab === "end"
                      ? "bg-amber-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}>
                  Hết hạn
                </button>
              </div>

              <ScrollArea className="h-60 pr-2">
                <div className="flex flex-col gap-2">
                  {timeSlots.map((time) => {
                    const currentTime = activeTab === "start" ? startTime : endTime;
                    const isDisabled = isTimeSlotDisabled(time, activeTab);
                    const isSelected = currentTime === time;

                    return (
                      <Button
                        key={`${activeTab}-${time}`}
                        ref={isSelected ? selectedButtonRef : null}
                        type="button"
                        disabled={isDisabled}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => {
                          if (!isDisabled) {
                            if (activeTab === "start") setStartTime(time);
                            else setEndTime(time);
                          }
                        }}
                        className={`w-full justify-center text-xs font-mono h-10 shadow-none rounded-xl transition-all ${
                          isDisabled
                            ? "opacity-30 cursor-not-allowed line-through bg-slate-900/20 border-slate-800 text-slate-600"
                            : isSelected
                              ? activeTab === "start"
                                ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-600 font-bold shadow-lg shadow-indigo-600/20"
                                : "bg-amber-600 hover:bg-amber-500 text-white border-amber-600 font-bold shadow-lg shadow-amber-600/20"
                              : "bg-slate-800/60 hover:bg-slate-800 text-slate-200 border-slate-700/80"
                        }`}>
                        {time}
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 px-5 py-4 bg-slate-950/40">
            <button
              type="button"
              onClick={handleClear}
              className="px-3.5 py-2 bg-slate-800 hover:bg-red-500/15 text-red-400 text-xs font-medium rounded-xl transition-colors border border-slate-700/50">
              Xóa lịch
            </button>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors border border-slate-700/50">
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/25 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Lưu
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
