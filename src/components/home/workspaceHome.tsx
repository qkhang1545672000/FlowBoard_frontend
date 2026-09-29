"use client";
import { MoreHorizontal, Plus } from "lucide-react";
import { Participant } from "@/types";
import WorkspaceCard from "./workspaceCard";
import { useWorkSpace } from "@/hooks/useWorkSpace";

import WorkspaceSkeleton from "./WorkspaceSkeleton";
import { WorkspaceResponse } from "@/types/workSpace";
interface Prop {
  mockWorkspaces: unknown;
  mockParticipants: Participant[];
}
const mockWorkspaces = [
  {
    id: "1",
    name: "Innovate Solutions",
    slug: "innovate-solutions",
    boardsCount: 6,
    updatedText: "2 hours ago",
    iconColor: "text-indigo-400",
    borderColor: "border-indigo-500/50",
  },
  {
    id: "2",
    name: "Marketing Dynamics",
    slug: "marketing-dynamics",
    boardsCount: 6,
    updatedText: "2 hours ago",
    iconColor: "text-amber-400",
    borderColor: "border-slate-800",
  },
  {
    id: "3",
    name: "Product Team",
    slug: "product-team",
    boardsCount: 6,
    updatedText: "2 hours ago",
    iconColor: "text-sky-400",
    borderColor: "border-sky-500/50",
  },
  {
    id: "4",
    name: "Design Crew",
    slug: "design-crew",
    boardsCount: 4,
    updatedText: "2 hours ago",
    iconColor: "text-purple-400",
    borderColor: "border-slate-800",
  },
  {
    id: "5",
    name: "Design Destion",
    slug: "design-destion",
    boardsCount: 4,
    updatedText: "2 hours ago",
    iconColor: "text-pink-400",
    borderColor: "border-slate-800",
  },
  {
    id: "6",
    name: "Design Team",
    slug: "design-team",
    boardsCount: 4,
    updatedText: "2 hours ago",
    iconColor: "text-emerald-400",
    borderColor: "border-slate-800",
  },
  {
    id: "7",
    name: "Colonet Team",
    slug: "colonet-team",
    boardsCount: 6,
    updatedText: "2 hours ago",
    iconColor: "text-indigo-400",
    borderColor: "border-slate-800",
  },
];
const mockParticipants: Participant[] = [
  {
    _id: "1",
    displayName: "Alex Rivera",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    joinedAt: "2026-01-01",
  },
  {
    _id: "2",
    displayName: "Mia Wong",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100",
    joinedAt: "2026-01-01",
  },
  {
    _id: "3",
    displayName: "Ben Carter",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    joinedAt: "2026-01-01",
  },
  { _id: "4", displayName: "Sophia Chen", avatarUrl: null, joinedAt: "2026-01-01" },
  { _id: "5", displayName: "Daniel Kim", avatarUrl: null, joinedAt: "2026-01-01" },
  { _id: "6", displayName: "Emma Watson", avatarUrl: null, joinedAt: "2026-01-01" },
  { _id: "7", displayName: "Liam Neeson", avatarUrl: null, joinedAt: "2026-01-01" },
  { _id: "8", displayName: "Olivia Parker", avatarUrl: null, joinedAt: "2026-01-01" },
];
const WorkspaceHome = () => {
  const { data: workspaces, isLoading } = useWorkSpace();
  if (isLoading) {
    return <WorkspaceSkeleton />;
  }
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
        {workspaces!.map((ws: WorkspaceResponse) => (
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
