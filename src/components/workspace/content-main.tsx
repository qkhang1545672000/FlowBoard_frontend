/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Mail, ChevronRight, ChevronLeft } from "lucide-react";
import { BoardCard } from "./board-card";
import { useWorkspaceDetail } from "@/hooks/useWorkSpace";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { CreateBoardModal } from "./create-board-modal";
import UserAvatar from "../ui/UserAvatar";
import { WorkspaceMember } from "@/types/workSpace";
import { useAuthStore } from "@/store/useAuthStore";
import { BoardOverview } from "@/types/board";
import MemberWorkspaceCard from "./memberWorkspaceCard";
import { WorkspaceRole } from "@/types";
import { WorkspaceChat } from "./workspace-chat";
import { useAuthSocket } from "@/hooks/useAuthSocket"; // 👉 Import hook socket realtime
import { useSocket } from "@/hooks/useSocket";

interface ContentMainProps {
  activeMainTab: "boards" | "chat";
  isMemberSidebarOpen: boolean;
  setIsMemberSidebarOpen: (open: boolean) => void;
}

const ContentMain = ({
  activeMainTab,
  isMemberSidebarOpen,
  setIsMemberSidebarOpen,
}: ContentMainProps) => {
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId) ?? "";
  const userCurrent = useAuthStore((state) => state.user);

  const userId = userCurrent?.id;

  const { data: workspaceDetail, isLoading } = useWorkspaceDetail(activeWorkspaceId);

  const members = workspaceDetail?.members;
  const isOwn = Boolean(
    members &&
    userId &&
    members.some(
      (m) =>
        (m.user?.id === userId && m.role === "OWNER") ||
        m.role === WorkspaceRole.LEADER_WORKSPACE,
    ),
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const membersList = useMemo(
    () => workspaceDetail?.members ?? [],
    [workspaceDetail?.members],
  );

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return membersList;
    const query = searchQuery.toLowerCase();

    return membersList.filter((m: WorkspaceMember) => {
      const userName = m.user?.name?.toLowerCase() ?? "";
      const userEmail = m.user?.email?.toLowerCase() ?? "";
      const memberRole = m.role?.toLowerCase() ?? "";

      return (
        userName.includes(query) ||
        userEmail.includes(query) ||
        memberRole.includes(query)
      );
    });
  }, [membersList, searchQuery]);

  if (isLoading) return <div className="p-8 text-slate-400">Loading workspace...</div>;

  const handleCreateBoardSubmit = (data: {
    title: string;
    description: string;
    memberIds: string[];
    leaderId: string | null;
  }) => {
    console.log("Dữ liệu tạo board:", data);
  };

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden relative">
      {/* MAIN BODY AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 space-y-6 text-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
              {workspaceDetail?.name || "Workspace"}
            </h1>
            <p className="text-slate-400 text-sm">
              {workspaceDetail?.description?.trim() || "Không có thông tin mô tả"}
            </p>
          </div>

          <div>
            {activeMainTab === "boards" && isOwn && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>Create Board</span>
              </button>
            )}
          </div>
        </div>

        {/* VIEW 1: BOARDS */}
        {activeMainTab === "boards" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-300">
                Danh sách Board ({workspaceDetail?.boards?.length || 0})
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

            {workspaceDetail?.boards && workspaceDetail.boards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workspaceDetail.boards.map((board: BoardOverview) => (
                  <BoardCard key={board.id} board={board} />
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
        )}

        {/* VIEW 2: CHAT */}
        {activeMainTab === "chat" && (
          <WorkspaceChat
            workspaceId={activeWorkspaceId}
            userId={userId}
            workspaceMembers={members}
          />
        )}

        <CreateBoardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          workspaceMembers={membersList}
          onCreateBoard={handleCreateBoardSubmit}
        />
      </main>

      {/* RIGHT SIDEBAR MEMBERS */}
      <aside
        className={`border-l border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col transition-all duration-300 ${
          isMemberSidebarOpen ? "w-80" : "w-12"
        }`}>
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          {isMemberSidebarOpen ? (
            <>
              <span className="font-semibold text-sm text-white truncate">
                Thành viên ({membersList.length})
              </span>
              <button
                onClick={() => setIsMemberSidebarOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Thu gọn Sidebar">
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsMemberSidebarOpen(true)}
              className="w-full flex justify-center text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Mở rộng Sidebar">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {isMemberSidebarOpen ? (
          <div className="flex-1 flex flex-col min-h-0 p-3 space-y-4">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm thành viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member: WorkspaceMember) => (
                  <MemberWorkspaceCard key={member.id} member={member} />
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  Không tìm thấy thành viên
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 shrink-0">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> Mời qua Email
              </span>
              <div className="flex gap-1.5">
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500 placeholder:text-slate-600 min-w-0"
                />
                <button
                  type="button"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer">
                  Mời
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-3 space-y-3 flex flex-col items-center">
            {filteredMembers.map((member: WorkspaceMember) => (
              <div key={member.id} className="relative group" title={member.user?.name}>
                <UserAvatar name={member.user?.name} type="chat" />
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                    member.user?.isOnline ? "bg-emerald-500" : "bg-slate-600"
                  }`}
                />
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
};

export default ContentMain;
