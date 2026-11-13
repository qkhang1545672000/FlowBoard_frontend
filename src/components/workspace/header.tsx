"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Bell,
  MessageSquare,
  LogOut,
  User as UserIcon,
  Settings,
  Users,
  LayoutGrid,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { useChatSocketStore } from "@/store/useChatSocketStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useUnreadWorkspaces, useUpdateLastRead } from "@/hooks/useWorkSpace";
import { useAuthStore } from "@/store/useAuthStore";
import UserAvatar from "../ui/UserAvatar";

interface HeaderProps {
  activeMainTab?: "boards" | "chat";
  setActiveMainTab?: (tab: "boards" | "chat") => void;
  isMemberSidebarOpen?: boolean;
  setIsMemberSidebarOpen?: (open: boolean) => void;
  membersCount?: number;
}

export function Header({
  activeMainTab = "boards",
  setActiveMainTab,
  isMemberSidebarOpen = true,
  setIsMemberSidebarOpen,
  membersCount = 0,
}: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const w = useWorkspaceStore((state) => state.activeWorkspaceId) ?? "";
  const user = useAuthStore((state) => state.user);
  const unRead = useChatSocketStore((state) => state.unreadWorkspaceIds);
  const resetUnread = useChatSocketStore((state) => state.resetUnreadChat);
  const { data: dataUnreadWorkspace } = useUnreadWorkspaces();
  const isUnRead = unRead.has(w) || dataUnreadWorkspace?.unreadWorkspaceIds.includes(w);
  const { mutate: updateLastRead } = useUpdateLastRead();

  useEffect(() => {
    if (activeMainTab == "chat") {
      resetUnread(w);
    }
  }, [activeMainTab, w, isUnRead, resetUnread]);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 gap-4">
      {/* Center Main Tabs Navigation (Nằm ngoài vùng thân) */}
      {setActiveMainTab && (
        <div className="hidden md:flex items-center gap-1 bg-slate-950/80 border border-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveMainTab("boards")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeMainTab === "boards"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}>
            <LayoutGrid className="w-4 h-4" />
            <span>Quản lý Bảng</span>
          </button>

          <button
            onClick={() => {
              setActiveMainTab("chat");
              resetUnread(w);
              if (isUnRead) {
                updateLastRead(w);
              }
            }}
            className={`relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeMainTab === "chat"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}>
            <MessageSquare className="w-4 h-4" />
            <span>Kênh Trò Chuyện</span>

            {/* 🔴 Hiển thị dấu "!" thông báo có tin nhắn mới khi chưa đứng ở tab chat */}
            {isUnRead && activeMainTab !== "chat" && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 text-[9px] font-bold text-white items-center justify-center">
                  !
                </span>
              </span>
            )}
          </button>
        </div>
      )}

      {/* Header Right Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Toggle Member Sidebar */}
        {setIsMemberSidebarOpen && (
          <button
            onClick={() => setIsMemberSidebarOpen(!isMemberSidebarOpen)}
            title={
              isMemberSidebarOpen
                ? "Thu gọn danh sách thành viên"
                : "Mở danh sách thành viên"
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              isMemberSidebarOpen
                ? "bg-slate-800 border-slate-700 text-indigo-400"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}>
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Thành viên ({membersCount})</span>
            {isMemberSidebarOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Notifications */}
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all relative cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
        </button>

        {/* Profile Dropdown Menu */}
      </div>
    </header>
  );
}
