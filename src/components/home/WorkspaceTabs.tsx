"use client";

import { Briefcase, Users } from "lucide-react";
import { WorkspaceFilterType } from "@/services/workspace.service";

interface WorkspaceTabsProps {
  activeTab: WorkspaceFilterType;
  onChangeTab: (tab: WorkspaceFilterType) => void;
  ownedCount: number;
  joinedCount: number;
}

export const WorkspaceTabs = ({
  activeTab,
  onChangeTab,
  ownedCount,
  joinedCount,
}: WorkspaceTabsProps) => {
  return (
    <div className="flex items-center gap-2">
      {/* Tab 1: MY WORKSPACES */}
      <button
        onClick={() => onChangeTab("owned")}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
          activeTab === "owned"
            ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        }`}>
        <Briefcase className="w-4 h-4" />
        <span>MY WORKSPACES</span>
        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
          {ownedCount}
        </span>
      </button>

      {/* Tab 2: JOINED WORKSPACES */}
      <button
        onClick={() => onChangeTab("joined")}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
          activeTab === "joined"
            ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        }`}>
        <Users className="w-4 h-4" />
        <span>JOINED WORKSPACES</span>
        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
          {joinedCount}
        </span>
      </button>
    </div>
  );
};
