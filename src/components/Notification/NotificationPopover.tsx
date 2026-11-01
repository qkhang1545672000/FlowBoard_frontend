"use client";

import { RefObject, useState } from "react";
import { createPortal } from "react-dom";
import { X, MessageSquare, Loader2 } from "lucide-react";
import NotificationCard from "./Notification";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useAcceptInvitation,
} from "@/hooks/useNotifications";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  coords?: { top: number; right: number; isAbove?: boolean } | null;
  triggerRef?: RefObject<HTMLButtonElement | null>;
}

export default function WorkspaceNotificationPopover({
  isOpen,
  onClose,
  coords = { top: 0, right: 0, isAbove: false },
  triggerRef, // 👈 Đã nhận prop triggerRef vào đây
}: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "chat" | "unread">("all");

  // Sử dụng các hook đã được tách riêng biệt chuẩn chỉnh
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: acceptInvitation } = useAcceptInvitation();

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "chat") return n.type === "chat";
    if (activeTab === "unread") return n.unread;
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[998]" onClick={onClose} />

      <div
        style={{
          position: "fixed",
          ...(coords?.isAbove
            ? { bottom: window.innerHeight - (coords?.top || 0) + 8 }
            : { top: coords?.top || 0 }),
          right: coords?.right || 0,
        }}
        className="w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/60 z-[999] p-3 text-xs space-y-3 animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Thông báo Workspace</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-full">
                {unreadCount} mới
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex bg-slate-800/60 p-1 rounded-xl gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-1 rounded-lg font-medium transition ${
              activeTab === "all"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}>
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-1 rounded-lg font-medium transition flex items-center justify-center gap-1 ${
              activeTab === "chat"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}>
            <MessageSquare className="w-3 h-3 text-sky-400" />
            Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("unread")}
            className={`flex-1 py-1 rounded-lg font-medium transition ${
              activeTab === "unread"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}>
            Chưa đọc
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              <span className="text-[11px]">Đang tải thông báo...</span>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                onMarkAsRead={() => markAsRead(item.id)}
              />
            ))
          ) : (
            <div className="py-6 text-center text-slate-500 text-[11px]">
              Không có thông báo nào trong mục này.
            </div>
          )}
        </div>

        <div className="pt-1 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={() => markAllAsRead()}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium transition">
            Đánh dấu tất cả là đã đọc
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
