"use client";

import React, { useState } from "react";
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
            onClick={() => setActiveMainTab("chat")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeMainTab === "chat"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}>
            <MessageSquare className="w-4 h-4" />
            <span>Kênh Trò Chuyện</span>
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
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-800 transition-all cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop"
              alt="Alex Rivera"
              className="w-8 h-8 rounded-full border border-indigo-500/50"
            />
            <span className="text-sm font-medium text-slate-200 pr-1 hidden sm:inline">
              Alex Rivera
            </span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-300 text-sm">
              <a
                href="#profile"
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-700/50">
                <UserIcon className="w-4 h-4" /> Profile
              </a>
              <a
                href="#settings"
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-700/50">
                <Settings className="w-4 h-4" /> Settings
              </a>
              <div className="my-1 border-t border-slate-700" />
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-red-400 hover:bg-slate-700/50 text-left cursor-pointer">
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
