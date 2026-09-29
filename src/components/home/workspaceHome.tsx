"use client";
import { MoreHorizontal, Plus } from "lucide-react";

import WorkspaceCard from "./workspaceCard";
import { useWorkSpace } from "@/hooks/useWorkSpace";

import WorkspaceSkeleton from "./WorkspaceSkeleton";
import { WorkspaceResponse } from "@/types/workSpace";

const WorkspaceHome = () => {
  const { data: workspaces, isPending, isError } = useWorkSpace();

  // 🟢 ĐÚNG: Chỉ hiện Skeleton khi BẮT ĐẦU TẢI LẦN ĐẦU VÀ CHƯA CÓ DỮ LIỆU
  const isInitialLoading = isPending && !workspaces;

  if (isInitialLoading) {
    return <WorkspaceSkeleton />;
  }

  if (isError) {
    return <div className="p-6 text-red-400">Có lỗi xảy ra khi tải dữ liệu.</div>;
  }

  console.log("dataaaaaa", workspaces);

  return (
    <section className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          MY WORKSPACES
        </h2>
        <button className="text-slate-400 hover:text-white p-1">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Grid chứa danh sách Workspace Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {workspaces?.map((ws: WorkspaceResponse) => (
          <WorkspaceCard key={ws.id} ws={ws} />
        ))}

        {/* Thẻ Nút Add New Workspace */}
        <button className="bg-slate-900/30 hover:bg-slate-800/50 border border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 flex items-center justify-center transition-all group min-h-[110px]">
          <div className="p-3 bg-slate-800/50 rounded-xl group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
          </div>
        </button>
      </div>
    </section>
  );
};

export default WorkspaceHome;
