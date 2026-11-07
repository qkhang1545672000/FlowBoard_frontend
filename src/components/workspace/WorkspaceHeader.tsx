import { Plus } from "lucide-react";
import { TaskTooltipTitle } from "../ui/TaskTooltipTitle";

interface WorkspaceHeaderProps {
  name?: string;
  description?: string;
  activeMainTab: "boards" | "chat";
  isOwn: boolean;
  onCreateBoardClick: () => void;
}

export const WorkspaceHeader = ({
  name,
  description,
  activeMainTab,
  isOwn,
  onCreateBoardClick,
}: WorkspaceHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
      <div>
        <TaskTooltipTitle
          title={
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
              {name || "Workspace"}
            </h1>
          }
          className="max-w-[200px]"
        />
        <TaskTooltipTitle
          title={
            <p className="text-slate-400 text-sm">
              {description?.trim() || "Không có thông tin mô tả"}
            </p>
          }
          className="max-w-[490px]"
        />
      </div>

      <div>
        {activeMainTab === "boards" && isOwn && (
          <button
            onClick={onCreateBoardClick}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Create Board</span>
          </button>
        )}
      </div>
    </div>
  );
};
