"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  MoreHorizontal,
  Plus,
  Briefcase,
  Users,
} from "lucide-react";

import WorkspaceCard from "./workspaceCard";
import CreateWorkspaceCard from "./CreateWorkspaceCard";
import { useCreateWorkspace, useWorkSpace } from "@/hooks/useWorkSpace";
import { useWorkspaceCounts } from "@/hooks/useWorkSpace"; // 👈 Import hook vừa tạo

import WorkspaceSkeleton from "./WorkspaceSkeleton";
import { WorkspaceResponse } from "@/types/workSpace";
import { formatWorkspaceSlug } from "@/lib/took";
import { WorkspaceFilterType } from "@/services/workspace.service";

const WorkspaceHome = () => {
  const [activeTab, setActiveTab] = useState<WorkspaceFilterType>("owned");

  // Lấy dữ liệu phân trang cho Tab hiện tại
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useWorkSpace(10, activeTab);

  // Lấy tổng số lượng của cả 2 tab
  const { data: counts } = useWorkspaceCounts();

  const { mutateAsync: createWorkspaceMutation } = useCreateWorkspace();
  const [isCreating, setIsCreating] = useState(false);

  const workspaces = data?.pages.flatMap((page) => page.data) ?? [];
  const isExpanded = (data?.pages.length ?? 0) > 1;
  const isInitialLoading = isPending && !data;

  if (isInitialLoading) {
    return <WorkspaceSkeleton />;
  }

  if (isError) {
    return <div className="p-6 text-red-400">Có lỗi xảy ra khi tải dữ liệu.</div>;
  }

  const handleCreateWorkspace = async (name: string) => {
    try {
      const slug = formatWorkspaceSlug(name);
      await createWorkspaceMutation({ name, slug });
      setIsCreating(false);
    } catch (error) {
      // Xử lý lỗi UI nếu cần
    }
    setIsCreating(false);
  };
  console.log("hêlll");
  return (
    <section className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
      {/* HEADER TABS SWITCHER */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          {/* Tab 1: MY WORKSPACES */}
          <button
            onClick={() => setActiveTab("owned")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "owned"
                ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}>
            <Briefcase className="w-4 h-4" />
            <span>MY WORKSPACES</span>
            {/* ✅ Luôn hiện badge số lượng */}
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {counts?.ownedCount ?? 0}
            </span>
          </button>

          {/* Tab 2: JOINED WORKSPACES */}
          <button
            onClick={() => setActiveTab("joined")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "joined"
                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}>
            <Users className="w-4 h-4" />
            <span>JOINED WORKSPACES</span>
            {/* ✅ Luôn hiện badge số lượng */}
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {counts?.joinedCount ?? 0}
            </span>
          </button>
        </div>

        <button className="text-slate-400 hover:text-white p-1">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* GRID CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nút Tạo Mới chỉ xuất hiện ở Tab "owned" */}
        {activeTab === "owned" && (
          <>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-slate-900/30 hover:bg-slate-800/50 border border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 flex items-center justify-center transition-all group min-h-[110px] cursor-pointer">
              <div className="p-3 bg-slate-800/50 rounded-xl group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
              </div>
            </button>

            {isCreating && (
              <CreateWorkspaceCard
                onCancel={() => setIsCreating(false)}
                onSubmit={handleCreateWorkspace}
              />
            )}
          </>
        )}

        {/* Danh sách Workspace */}
        {workspaces.length > 0 ? (
          workspaces.map((ws: WorkspaceResponse) => <WorkspaceCard key={ws.id} ws={ws} />)
        ) : activeTab === "joined" ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800/60 rounded-2xl">
            Bạn chưa tham gia workspace nào khác.
          </div>
        ) : null}

        {/* Nút Xem thêm / Thu lại */}
        {hasNextPage ? (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="bg-slate-900/30 hover:bg-slate-800/60 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group min-h-[110px] disabled:opacity-50 disabled:cursor-not-allowed">
            {isFetchingNextPage ? (
              <div className="flex flex-col items-center gap-2 text-indigo-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-medium text-slate-400">Đang tải...</span>
              </div>
            ) : (
              <>
                <div className="p-2.5 bg-slate-800/60 rounded-xl group-hover:bg-indigo-500/10 group-hover:text-indigo-400 text-slate-400 transition-colors">
                  <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                </div>
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                  Xem thêm
                </span>
              </>
            )}
          </button>
        ) : isExpanded ? (
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="bg-slate-900/30 hover:bg-slate-800/60 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group min-h-[110px]">
            <div className="p-2.5 bg-slate-800/60 rounded-xl group-hover:bg-amber-500/10 group-hover:text-amber-400 text-slate-400 transition-colors">
              <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
              Thu lại
            </span>
          </button>
        ) : null}
      </div>
    </section>
  );
};

export default WorkspaceHome;
