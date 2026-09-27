import React from "react";
import { Header } from "@/components/workspace/header";
import { BoardCard } from "@/components/workspace/board-card";
import { Board, BoardVisibility } from "@/types";
import { Plus } from "lucide-react";

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

export default function WorkspaceDashboard({ params }: { params: { slug: string } }) {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 min-h-screen text-slate-100">
      <Header />

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Workspace Title & Info */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              Innovate Solutions
            </h1>
            <p className="text-slate-400 text-sm">
              Active workspace for product development and marketing projects.
            </p>
          </div>

          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20">
            <Plus className="w-4 h-4" />
            <span>Create Board</span>
          </button>
        </div>

        {/* Boards Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-200">Boards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockBoards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
