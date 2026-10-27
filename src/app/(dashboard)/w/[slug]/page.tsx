"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/workspace/header";
import ContentMain from "@/components/workspace/content-main";
import { useWorkspaceDetail } from "@/hooks/useWorkSpace";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export default function WorkspaceDashboard({ params }: { params: { slug: string } }) {
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);

  const { data: workspaceDetail } = useWorkspaceDetail(activeWorkspaceId ?? "");

  // Clear workspace khi người dùng thoát khỏi trang này (unmount)

  // Quản lý trạng thái Tab Nằm Ngoài Vùng Thân Main
  const [activeMainTab, setActiveMainTab] = useState<"boards" | "chat">("boards");

  // Quản lý trạng thái Thu/Mở Sidebar Thành Viên Bên Phải
  const [isMemberSidebarOpen, setIsMemberSidebarOpen] = useState(true);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 min-h-screen text-slate-100 overflow-hidden">
      {/* Header chứa bộ nút Chuyển Tab bên ngoài & Nút Thu/Mở Sidebar bên phải */}
      <Header
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        isMemberSidebarOpen={isMemberSidebarOpen}
        setIsMemberSidebarOpen={setIsMemberSidebarOpen}
        membersCount={workspaceDetail?.members?.length ?? 0}
      />

      {/* Main Content & Right Member Sidebar */}
      <ContentMain
        activeMainTab={activeMainTab}
        isMemberSidebarOpen={isMemberSidebarOpen}
        setIsMemberSidebarOpen={setIsMemberSidebarOpen}
      />
    </div>
  );
}
