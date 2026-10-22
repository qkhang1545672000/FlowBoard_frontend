"use client";

import React from "react";
import { X, Clock, User, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useActivityLogs } from "@/hooks/useActivityLog";

interface BoardHistoryModalProps {
  boardId: string;
  boardTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BoardHistoryModal({
  boardId,
  boardTitle,
  isOpen,
  onClose,
}: BoardHistoryModalProps) {
  // Sử dụng React Query để gọi API lấy log thật từ server
  const { data, isLoading } = useActivityLogs(
    { boardId, page: 1, limit: 20 },
    isOpen, // Chỉ gọi API khi modal mở
  );

  const logs = data?.items || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">
              Lịch sử hoạt động: <span className="text-indigo-400">{boardTitle}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Đang tải lịch sử...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Chưa có lịch sử hoạt động nào.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5 flex items-start gap-3">
                  {log.user?.image ? (
                    <img
                      src={log.user.image}
                      alt={log.user.name}
                      className="w-8 h-8 rounded-full object-cover mt-0.5"
                    />
                  ) : (
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">
                        {log.user?.name || "Người dùng ẩn danh"}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                    </div>

                    {/* Hiển thị hành động tùy biến dựa vào log.action và details */}
                    <p className="text-xs text-slate-300">
                      {log.action === "CREATED_TASK" && (
                        <>
                          Đã tạo task:{" "}
                          <span className="text-indigo-300 font-medium">
                            &quot;{log.details?.taskTitle || log.details?.title}&quot;
                          </span>
                        </>
                      )}
                      {log.action === "MOVED_TASK" && (
                        <>
                          Đã chuyển task{" "}
                          <span className="text-indigo-300 font-medium">
                            &quot;{log.details?.taskTitle}&quot;
                          </span>{" "}
                          từ cột{" "}
                          <span className="text-amber-300">
                            &quot;{log.details?.fromColumn?.name}&quot;
                          </span>{" "}
                          sang cột{" "}
                          <span className="text-emerald-300">
                            &quot;{log.details?.toColumn?.name}&quot;
                          </span>
                        </>
                      )}
                      {log.action === "UPDATED_TASK" && (
                        <>
                          Đã cập nhật task{" "}
                          <span className="text-indigo-300 font-medium">
                            &quot;{log.details?.taskTitle}&quot;
                          </span>
                        </>
                      )}
                      {log.action === "DELETED_TASK" && (
                        <>
                          Đã xóa task{" "}
                          <span className="text-red-400 font-medium">
                            &quot;{log.details?.taskTitle}&quot;
                          </span>
                        </>
                      )}
                      {/* Fallback nếu có action khác */}
                      {![
                        "CREATED_TASK",
                        "MOVED_TASK",
                        "UPDATED_TASK",
                        "DELETED_TASK",
                      ].includes(log.action) && <>{log.action}</>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
