import { Search } from "lucide-react";
import { BoardCard } from "./board-card";
import { BoardOverview } from "@/types/board";
import { WorkspaceMember } from "@/types/workSpace";

interface BoardsViewProps {
  boards?: BoardOverview[];
  members: WorkspaceMember[];
}

export const BoardsView = ({ boards = [], members }: BoardsViewProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-300">
          Danh sách Board ({boards.length})
        </h2>
        {/* Search Bar */}
        <div className="relative w-72 sm:w-80 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search boards, tasks... (Ctrl+K)"
            className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {boards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board: BoardOverview) => (
            <BoardCard key={board.id} board={board} workspaceMembers={members} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-slate-400">
          <p className="text-sm font-medium">
            Chưa có board nào trong không gian làm việc này
          </p>
        </div>
      )}
    </div>
  );
};
