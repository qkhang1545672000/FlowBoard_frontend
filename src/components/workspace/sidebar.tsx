"use client";

import React from "react";
import Link from "next/link";
import {
  Plus,
  FolderKanban, // Icon cho Workspace
  Kanban, // Icon cho Board
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { WorkspaceResponse } from "@/types/workSpace";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useBoardStore } from "@/store/useBoardStore";
import { useWorkspaceDetail } from "@/hooks/useWorkSpace";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
  workspaces: WorkspaceResponse[];
  currentWorkspaceSlug?: string;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function Sidebar({
  workspaces = [],
  currentWorkspaceSlug,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);
  const currentBoardSlug = useBoardStore((state) => state.activeBoardSlug);
  const activeBoardId = useBoardStore((state) => state.activeBoardId);
  const setBoardId = useBoardStore((state) => state.setActiveBoard);
  const clearActiveBoard = useBoardStore((state) => state.clearActiveBoard);

  // Khai báo kiểm tra thanh địa chỉ (URL)
  const pathname = usePathname();
  const isInBoard = pathname ? pathname.includes("/b/") : false;
  const isInWorkspace = pathname ? pathname.includes("/w/") : false;

  // 🟢 TỰ ĐỘNG SUY DIỄN ID DỰA TRÊN URL (Chống lưu vết ID cũ gây lỗi 404)
  const parts = pathname ? pathname.split("/") : [];
  const wIndex = parts.indexOf("w");
  const workspaceSlugFromUrl = wIndex !== -1 ? parts[wIndex + 1] : null;

  // Tìm workspace đang khớp với URL hoặc prop hiện tại
  const activeWorkspace = workspaces.find(
    (ws) => ws.slug === workspaceSlugFromUrl || ws.slug === currentWorkspaceSlug,
  );
  const activeWorkspaceId = activeWorkspace ? activeWorkspace.id : "";

  const { data: workSpaceDetail } = useWorkspaceDetail(activeWorkspaceId);
  const router = useRouter();

  // Xử lý nút quay lại thông minh
  const handleBackAction = () => {
    if (activeBoardId) {
      // Nếu đang trong board, khi bấm quay lại sẽ clear board để hiện lại danh sách workspace
      clearActiveBoard();
      localStorage.removeItem("active-board-storage");
      if (currentWorkspaceSlug) {
        router.push(`/w/${currentWorkspaceSlug}`);
      } else {
        router.back();
      }
    } else {
      // Nếu đang ở workspace, quay lại bình thường
      router.back();
    }
  };

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

      <div className="p-3 space-y-6 overflow-y-auto">
        {/* Logo / Brand */}
        <Link href={"/"} className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
            W
          </div>
          {!isCollapsed && (
            <span className="font-bold text-base text-white tracking-wide truncate whitespace-nowrap">
              Workspace Central
            </span>
          )}
        </Link>

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

        {/* Workspaces & Boards List */}
        <div>
          <div className="space-y-1">
            {isInWorkspace && (
              // Nhánh 1: Nếu thanh địa chỉ có "/w/" -> Hiển thị danh sách Workspace
              <>
                {!isCollapsed && (
                  <div className="text-[11px] font-semibold uppercase text-slate-500 px-2 mb-2 tracking-wider whitespace-nowrap">
                    Workspaces
                  </div>
                )}
                {workspaces?.map((ws) => {
                  const isActive =
                    currentWorkspaceSlug === ws.slug || workspaceSlugFromUrl === ws.slug;
                  return (
                    <Link
                      key={ws.id}
                      onClick={() => setActiveWorkspace({ id: ws.id, slug: ws.slug })}
                      href={`/w/${ws.slug}`}
                      title={ws.name}
                      className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm transition-all ${
                        isActive
                          ? "bg-indigo-600/20 text-indigo-400 font-medium border border-indigo-500/30"
                          : "hover:bg-slate-800/80 text-slate-400 hover:text-slate-200"
                      }`}>
                      {/* Dùng icon FolderKanban biểu trưng cho Workspace */}
                      <FolderKanban className="w-4 h-4 shrink-0 text-indigo-400" />
                      {!isCollapsed && (
                        <span className="truncate whitespace-nowrap">{ws.name}</span>
                      )}
                    </Link>
                  );
                })}
              </>
            )}

            {isInBoard && (
              // Nhánh 2: Nếu thanh địa chỉ có "/b/" -> Hiển thị danh sách Board trong Workspace đó
              <>
                {!isCollapsed && (
                  <div className="text-[11px] font-semibold uppercase text-slate-500 px-2 mb-2 tracking-wider whitespace-nowrap">
                    Boards
                  </div>
                )}
                {workSpaceDetail?.boards?.map((ws) => {
                  const isActive = currentBoardSlug === ws.slug;
                  return (
                    <Link
                      key={ws.id}
                      onClick={() => setBoardId({ id: ws.id, slug: ws.slug })}
                      href={`/b/${ws.slug}`}
                      title={ws.title}
                      className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm transition-all ${
                        isActive
                          ? "bg-indigo-600/20 text-indigo-400 font-medium border border-indigo-500/30"
                          : "hover:bg-slate-800/80 text-slate-400 hover:text-slate-200"
                      }`}>
                      {/* Dùng icon Kanban biểu trưng cho Board công việc */}
                      <Kanban className="w-4 h-4 shrink-0 text-emerald-400" />
                      {!isCollapsed && (
                        <span className="truncate whitespace-nowrap">{ws.title}</span>
                      )}
                    </Link>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer Button: Quay lại */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleBackAction}
          className={`group w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30 border border-indigo-500/40 ${
            isCollapsed ? "px-2" : "px-4"
          }`}
          title="Quay lại">
          <ArrowLeft className="w-4 h-4 shrink-0 text-white group-hover:-translate-x-0.5 transition-transform" />
          {!isCollapsed && (
            <span className="whitespace-nowrap font-semibold">Quay lại</span>
          )}
        </button>
      </div>
    </aside>
  );
}
