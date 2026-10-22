"use client";

import React, { useState, Suspense } from "react";
import { Sidebar } from "@/components/workspace/sidebar";
import { SidebarSkeleton } from "@/components/workspace/SidebarSkeleton";
import { useWorkSpace } from "@/hooks/useWorkSpace";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { WorkspaceSlugSync } from "@/components/workspace/WorkspaceSlugSync";
import { BoardSlugSync } from "@/components/board/BoardSlugSync"; // <-- Import component mới tạo
import { usePathname } from "next/navigation";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const activeWorkspaceSlug = useWorkspaceStore((state) => state.activeWorkspaceSlug);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data, isPending } = useWorkSpace();
  const workspacesList = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
      {/* 1. Các component xử lý đồng bộ URL ngầm (Workspace và Board Slug -> ID) */}
      <Suspense fallback={null}>
        <WorkspaceSlugSync />
        <BoardSlugSync />
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
