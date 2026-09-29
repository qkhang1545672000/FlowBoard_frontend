"use client";

import { useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";

import WorkspaceCard from "./workspaceCard";
import CreateWorkspaceCard from "./CreateWorkspaceCard";
import { useCreateWorkspace, useWorkSpace } from "@/hooks/useWorkSpace";

import WorkspaceSkeleton from "./WorkspaceSkeleton";
import { WorkspaceResponse } from "@/types/workSpace";
import { formatWorkspaceSlug } from "@/lib/took";

const WorkspaceHome = () => {
  const { data: workspaces, isPending, isError } = useWorkSpace();
  const { mutateAsync: createWorkspaceMutation, isPending: isCreatingAPI } =
    useCreateWorkspace();

  const [isCreating, setIsCreating] = useState(false);

  const isInitialLoading = isPending && !workspaces;

  if (isInitialLoading) {
    return <WorkspaceSkeleton />;
  }

  if (isError) {
    return <div className="p-6 text-red-400">Có lỗi xảy ra khi tải dữ liệu.</div>;
  }

  const handleCreateWorkspace = async (name: string) => {
    try {
      // 3. Gọi hàm tạo
      const slug = formatWorkspaceSlug(name);
      await createWorkspaceMutation({ name, slug });

      // Đóng thẻ nhập sau khi tạo xong
      setIsCreating(false);
    } catch (error) {
      // Xử lý lỗi UI nếu cần
    }
    setIsCreating(false);
  };

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
        {/* 3. Nút Add New Workspace (Luôn luôn hiển thị) */}
        <button
          onClick={() => setIsCreating(true)}
          className="bg-slate-900/30 hover:bg-slate-800/50 border border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 flex items-center justify-center transition-all group min-h-[110px]">
          <div className="p-3 bg-slate-800/50 rounded-xl group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
          </div>
        </button>
        {/* 2. Thẻ nhập tên Workspace (Chèn trước nút Add nếu đang bật isCreating) */}
        {isCreating && (
          <CreateWorkspaceCard
            onCancel={() => setIsCreating(false)}
            onSubmit={handleCreateWorkspace}
          />
        )}
        {/* 1. Các Workspace hiện có */}
        {workspaces?.map((ws: WorkspaceResponse) => (
          <WorkspaceCard key={ws.id} ws={ws} />
        ))}
      </div>
    </section>
  );
};

export default WorkspaceHome;
