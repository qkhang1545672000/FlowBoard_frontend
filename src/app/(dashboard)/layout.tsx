"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/workspace/sidebar";
import { SidebarSkeleton } from "@/components/workspace/SidebarSkeleton";
import { useWorkSpace } from "@/hooks/useWorkSpace";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { data: workspaces, isLoading } = useWorkSpace();
  const activeWorkspaceSlug = useWorkspaceStore((state) => state.activeWorkspaceSlug);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
      {/* 1. Giữ nguyên khung Flexbox layout, chỉ switch giữa Skeleton và Sidebar thật */}
      {isLoading ? (
        <SidebarSkeleton isCollapsed={isCollapsed} />
      ) : (
        <Sidebar
          workspaces={workspaces ?? []}
          currentWorkspaceSlug={activeWorkspaceSlug ?? ""}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      )}

      {/* 2. Nội dung chính luôn luôn được render song song, không bị mất khi loading sidebar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
