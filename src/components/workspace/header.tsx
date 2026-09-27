"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  MessageSquare,
  LogOut,
  User as UserIcon,
  Settings,
} from "lucide-react";

export function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search Bar */}
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search boards, tasks... (Ctrl+K)"
          className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center gap-4">
        {/* Real-time Chat Trigger */}
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all relative">
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
        </button>

        {/* Profile Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-800 transition-all">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop"
              alt="Alex Rivera"
              className="w-8 h-8 rounded-full border border-indigo-500/50"
            />
            <span className="text-sm font-medium text-slate-200 pr-1">Alex Rivera</span>
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
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-red-400 hover:bg-slate-700/50 text-left">
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
