"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { Workspace } from "@/types";

interface SidebarProps {
  workspaces: Workspace[];
  currentWorkspaceSlug?: string;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function Sidebar({
  workspaces,
  currentWorkspaceSlug,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`relative bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen text-slate-300 transition-all duration-300 ease-in-out z-40 ${
        isCollapsed ? "w-16" : "w-64"
      }`}>
      {/* Nút Đẩy Vào / Đẩy Ra (Toggle Collapse Button) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-indigo-600 hover:bg-indigo-500 text-white p-1 rounded-full shadow-lg border border-slate-900 transition-transform z-50"
        title={isCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}>
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      <div className="p-3 space-y-6 overflow-hidden">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
            W
          </div>
          {!isCollapsed && (
            <span className="font-bold text-base text-white tracking-wide truncate whitespace-nowrap">
              Workspace Central
            </span>
          )}
        </div>

        {/* User Info Quick View */}
        <div className="bg-slate-800/60 rounded-xl p-2.5 flex items-center gap-3 border border-slate-700/50">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop"
            alt="Alex Rivera"
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
          {!isCollapsed && (
            <div className="flex flex-col text-xs truncate whitespace-nowrap">
              <span className="font-semibold text-slate-200 truncate">Alex Rivera</span>
              <span className="text-slate-400">Logged in</span>
            </div>
          )}
        </div>

        {/* Workspaces List */}
        <div>
          {!isCollapsed && (
            <div className="text-[11px] font-semibold uppercase text-slate-500 px-2 mb-2 tracking-wider whitespace-nowrap">
              Workspaces
            </div>
          )}
          <div className="space-y-1">
            {workspaces.map((ws) => {
              const isActive = currentWorkspaceSlug === ws.slug;
              return (
                <Link
                  key={ws.id}
                  href={`/w/${ws.slug}`}
                  title={ws.name}
                  className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? "bg-indigo-600/20 text-indigo-400 font-medium border border-indigo-500/30"
                      : "hover:bg-slate-800/80 text-slate-400 hover:text-slate-200"
                  }`}>
                  <Briefcase className="w-4 h-4 shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate whitespace-nowrap">{ws.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Button: Create Workspace */}
      <div className="p-3 border-t border-slate-800">
        <button
          className={`w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 ${
            isCollapsed ? "px-2" : "px-4"
          }`}
          title="Create Workspace">
          <Plus className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Create Workspace</span>}
        </button>
      </div>
    </aside>
  );
}
