"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/workspace/sidebar";
import { SidebarSkeleton } from "@/components/workspace/SidebarSkeleton";
import { useWorkSpace } from "@/hooks/useWorkSpace";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  // 1. Dùng destructured props đúng với useInfiniteQuery
  const { data, isPending } = useWorkSpace();
  const activeWorkspaceSlug = useWorkspaceStore((state) => state.activeWorkspaceSlug);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 2. Phẳng hóa mảng workspaces từ các trang (pages)
  const workspacesList = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
      {/* 1. Giữ nguyên khung Flexbox layout, switch giữa Skeleton và Sidebar */}
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

      {/* 2. Nội dung chính */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
