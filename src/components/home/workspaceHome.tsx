"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2, MoreHorizontal, Plus } from "lucide-react";

import WorkspaceCard from "./workspaceCard";
import CreateWorkspaceCard from "./CreateWorkspaceCard";
import { useCreateWorkspace, useWorkSpace } from "@/hooks/useWorkSpace";

import WorkspaceSkeleton from "./WorkspaceSkeleton";
import { WorkspaceResponse } from "@/types/workSpace";
import { formatWorkspaceSlug } from "@/lib/took";

const WorkspaceHome = () => {
  // Lấy dữ liệu và các hàm từ useInfiniteQuery
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useWorkSpace(10); // Giới hạn 10 items/lần

  const { mutateAsync: createWorkspaceMutation } = useCreateWorkspace();
  const [isCreating, setIsCreating] = useState(false);

  // Gom các trang (pages) thành mảng phẳng danh sách workspace
  const workspaces = data?.pages.flatMap((page) => page.data) ?? [];

  // Kiểm tra xem người dùng đã tải thêm dữ liệu (trang > 1) hay chưa
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

  // Hàm xử lý Thu lại: Chỉ giữ lại trang đầu tiên trong cache React Query
  const handleCollapse = () => {
    // Nếu bạn muốn thu gọn danh sách về lại 10 items đầu
    // Bằng cách cắt mảng hiển thị hoặc re-fetch lại page 1
    window.scrollTo({ top: 0, behavior: "smooth" }); // Cuộn nhẹ lên đầu nếu cần
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

      {/* Grid chứa danh sách Workspace Cards & Card Nút bấm */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Thẻ Tạo mới */}
        <button
          onClick={() => setIsCreating(true)}
          className="bg-slate-900/30 hover:bg-slate-800/50 border border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 flex items-center justify-center transition-all group min-h-[110px]">
          <div className="p-3 bg-slate-800/50 rounded-xl group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
          </div>
        </button>

        {/* 2. Form nhập tên Workspace */}
        {isCreating && (
          <CreateWorkspaceCard
            onCancel={() => setIsCreating(false)}
            onSubmit={handleCreateWorkspace}
          />
        )}

        {/* 3. Danh sách Workspace Cards */}
        {workspaces.map((ws: WorkspaceResponse) => (
          <WorkspaceCard key={ws.id} ws={ws} />
        ))}

        {/* 4. Nút "Xem thêm" / "Thu lại" (Chuyển đổi theo trạng thái) */}
        {hasNextPage ? (
          // NÚT XEM THÊM (Hiển thị khi còn dữ liệu để tải)
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
          // NÚT THU LẠI (Hiển thị khi đã tải hết dữ liệu và số trang > 1)
          <button
            onClick={() => {
              // Reset dữ liệu về trang đầu tiên hoặc tải lại
              window.location.reload(); // Hoặc gọi refetch/resetQueries của react-query
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
