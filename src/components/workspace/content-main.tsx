"use client";
import { Plus } from "lucide-react";
import { BoardCard } from "./board-card";
import { Board, BoardVisibility } from "@/types";
import { useWorkspaceDetail } from "@/hooks/useWorkSpace";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
const mockBoards: Board[] = [
  {
    id: "1",
    workspaceId: "ws-1",
    title: "Product Roadmap",
    visibility: BoardVisibility.WORKSPACE,
    activeTasksCount: 14,
    membersCount: 8,
    updatedAt: "2 hours ago",
  },
  {
    id: "2",
    workspaceId: "ws-1",
    title: "Sales Tracker",
    visibility: BoardVisibility.WORKSPACE,
    activeTasksCount: 9,
    membersCount: 4,
    updatedAt: "1 day ago",
  },
  {
    id: "3",
    workspaceId: "ws-1",
    title: "Q3 Design Review",
    visibility: BoardVisibility.PUBLIC,
    activeTasksCount: 22,
    membersCount: 12,
    updatedAt: "3 hours ago",
  },
];
const ContentMain = () => {
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const {
    data: workspaceDetail,
    isLoading,
    isError,
    error,
  } = useWorkspaceDetail(activeWorkspaceId ?? "");
  if (isLoading) return "loading";

  return (
    <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Workspace Title & Info */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            {workspaceDetail?.name}
          </h1>
          <p className="text-slate-400 text-sm">
            {workspaceDetail?.description.trim() != ""
              ? workspaceDetail?.description
              : "không có thông tin"}
          </p>
        </div>
      </div>

      {/* Boards Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-200">Boards</h2>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20">
            <Plus className="w-4 h-4" />
            <span>Create Board</span>
          </button>
        </div>

        {workspaceDetail?.boards && workspaceDetail.boards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaceDetail.boards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed border-slate-700 bg-slate-900/50 text-slate-400">
            <p className="text-sm font-medium">Chưa có board nào</p>
          </div>
        )}
      </div>
    </main>
  );
};
export default ContentMain;
