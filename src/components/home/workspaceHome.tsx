"use client";

import { useState } from "react";
import { MoreHorizontal, Loader2, ChevronDown, ChevronUp } from "lucide-react";

import WorkspaceCard from "./workspaceCard";
import WorkspaceSkeleton from "./WorkspaceSkeleton";
import { WorkspaceTabs } from "./WorkspaceTabs";
import { CreateWorkspaceTrigger } from "./CreateWorkspaceTrigger";

import {
  useCreateWorkspace,
  useWorkSpace,
  useWorkspaceCounts,
} from "@/hooks/useWorkSpace";
import { WorkspaceResponse } from "@/types/workSpace";
import { WorkspaceFilterType } from "@/services/workspace.service";

const WorkspaceHome = () => {
  const [activeTab, setActiveTab] = useState<WorkspaceFilterType>("owned");

  // Lấy dữ liệu phân trang cho Tab hiện tại
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useWorkSpace(10, activeTab);

  // Lấy tổng số lượng của cả 2 tab
  const { data: counts } = useWorkspaceCounts();

  const workspaces = data?.pages.flatMap((page) => page.data) ?? [];
  const isExpanded = (data?.pages.length ?? 0) > 1;
  const isInitialLoading = isPending && !data;

  if (isInitialLoading) {
    return <WorkspaceSkeleton />;
  }

  if (isError) {
    return <div className="p-6 text-red-400">Có lỗi xảy ra khi tải dữ liệu.</div>;
  }

  return (
    <section className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md shadow-xl space-y-6">
      {/* HEADER TABS SWITCHER */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <WorkspaceTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          ownedCount={counts?.ownedCount ?? 0}
          joinedCount={counts?.joinedCount ?? 0}
        />

        <button className="text-slate-400 hover:text-white p-1">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* GRID CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nút Tạo Mới chỉ xuất hiện ở Tab "owned" */}
        {activeTab === "owned" && <CreateWorkspaceTrigger />}

        {/* Danh sách Workspace */}
        {workspaces.length > 0 ? (
          workspaces.map((ws: WorkspaceResponse) => <WorkspaceCard key={ws.id} ws={ws} />)
        ) : activeTab === "joined" ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800/60 rounded-2xl">
            Bạn chưa tham gia workspace nào khác.
          </div>
        ) : null}

        {/* Nút Xem thêm / Về đầu trang */}
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
              window.scrollTo({ top: 0, behavior: "smooth" });
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
