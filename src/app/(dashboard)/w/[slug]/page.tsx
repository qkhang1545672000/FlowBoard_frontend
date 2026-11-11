"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/workspace/header";
import ContentMain from "@/components/workspace/content-main";
import { useWorkspaceDetail } from "@/hooks/useWorkSpace";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

function WorkspaceDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const { data: workspaceDetail } = useWorkspaceDetail(activeWorkspaceId ?? "");

  // Đọc trạng thái tab trực tiếp từ URL, mặc định là "boards"
  const tabParam = searchParams.get("tab");
  const activeMainTab: "boards" | "chat" = tabParam === "chat" ? "chat" : "boards";

  const handleSetActiveMainTab = (tab: "boards" | "chat") => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("tab", tab);
    router.replace(`?${currentParams.toString()}`, { scroll: false });
  };

  const [isMemberSidebarOpen, setIsMemberSidebarOpen] = useState(true);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 min-h-screen text-slate-100 overflow-hidden">
      <Header
        activeMainTab={activeMainTab}
        setActiveMainTab={handleSetActiveMainTab}
        isMemberSidebarOpen={isMemberSidebarOpen}
        setIsMemberSidebarOpen={setIsMemberSidebarOpen}
        membersCount={workspaceDetail?.members?.length ?? 0}
      />
      <ContentMain
        activeMainTab={activeMainTab}
        isMemberSidebarOpen={isMemberSidebarOpen}
        setIsMemberSidebarOpen={setIsMemberSidebarOpen}
      />
    </div>
  );
}

export default function WorkspaceDashboard({ params }: { params: { slug: string } }) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400 min-h-screen">
          Đang tải...
        </div>
      }>
      <WorkspaceDashboardContent />
    </Suspense>
  );
}
