"use client";

import React, { useState, Suspense, useEffect } from "react";
import { Sidebar } from "@/components/workspace/sidebar";
import { SidebarSkeleton } from "@/components/workspace/SidebarSkeleton";
import { useWorkSpace } from "@/hooks/useWorkSpace";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { WorkspaceSlugSync } from "@/components/workspace/WorkspaceSlugSync";
import { usePathname } from "next/navigation";
import { useBoardStore } from "@/store/useBoardStore";

// Component con xử lý pathname và useEffect để tránh lỗi blocking prerender
function BoardCleanupWatcher() {
  const pathname = usePathname();
  const clearActiveBoard = useBoardStore((state) => state.clearActiveBoard);

  useEffect(() => {
    // Nếu đường dẫn hiện tại không chứa chữ "/b/" (thoát khỏi khu vực board)
    if (pathname && !pathname.startsWith("/b/")) {
      clearActiveBoard();
      localStorage.removeItem("active-board-storage");
    }
  }, [pathname, clearActiveBoard]);

  return null;
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const activeWorkspaceSlug = useWorkspaceStore((state) => state.activeWorkspaceSlug);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data, isPending } = useWorkSpace();
  const workspacesList = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
      {/* 1. Các component sử dụng dữ liệu URL được bọc trong Suspense */}
      <Suspense fallback={null}>
        <WorkspaceSlugSync />
        <BoardCleanupWatcher />
      </Suspense>

      {/* 2. Sidebar */}
      {isPending && !data ? (
        <SidebarSkeleton isCollapsed={isCollapsed} />
      ) : (
        <Sidebar
          workspaces={workspacesList}
          currentWorkspaceSlug={activeWorkspaceSlug ?? ""}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      )}

      {/* 3. Nội dung chính */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
