import { Header } from "@/components/workspace/header";
import { BoardCard } from "@/components/workspace/board-card";
import { Board, BoardVisibility } from "@/types";
import { Plus } from "lucide-react";
import ContentMain from "@/components/workspace/content-main";

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

      <ContentMain />
    </div>
  );
}
