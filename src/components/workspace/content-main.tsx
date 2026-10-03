/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { Plus, Search, UserPlus, MoreVertical, Mail } from "lucide-react";
import { BoardCard } from "./board-card";
import { useWorkspaceDetail } from "@/hooks/useWorkSpace";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { CreateBoardModal } from "./create-board-modal";
import UserAvatar from "../ui/UserAvatar";
import { WorkspaceMember } from "@/types/workSpace";
import { useAuthStore } from "@/store/useAuthStore";
import { BoardOverview } from "@/types/board";

const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const ContentMain = () => {
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const userCurrent = useAuthStore((state) => state.user);

  const { data: workspaceDetail, isLoading } = useWorkspaceDetail(
    activeWorkspaceId ?? "",
  );

  // 1. Kiểm tra vai trò OWNER bằng useMemo
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const isOwn = useMemo(() => {
    if (!workspaceDetail?.members || !userCurrent?.id) return false;
    return workspaceDetail.members.some(
      (m) => m.user?.id === userCurrent.id && m.role === "OWNER",
    );
  }, [workspaceDetail?.members, userCurrent?.id]);

  const [activeTab, setActiveTab] = useState<"boards" | "members">("boards");
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Tách danh sách Members
  const membersList = workspaceDetail?.members ?? [];

  // 3. ĐÃ SỬA LỖI: Lọc thành viên đúng theo m.user.name và m.user.email
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

  const memberPages = chunkArray(filteredMembers, 6);

  if (isLoading) return <div className="p-8 text-slate-400">Loading...</div>;

  const handleCreateBoardSubmit = (data: {
    title: string;
    description: string;
    memberIds: string[];
    leaderId: string | null;
  }) => {
    console.log("Dữ liệu tạo board:", data);
    // Call API tạo board tại đây
  };

  return (
    <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-6 text-slate-200">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            {workspaceDetail?.name || "Workspace"}
          </h1>
          <p className="text-slate-400 text-sm">
            {workspaceDetail?.description?.trim() || "không có thông tin"}
          </p>
        </div>

        <div>
          {activeTab === "boards" ? (
            isOwn && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>Create Board</span>
              </button>
            )
          ) : (
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer">
              <UserPlus className="w-4 h-4" />
              <span>Manage Members</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-6 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab("boards")}
          className={`pb-3 font-semibold text-sm transition-colors relative cursor-pointer ${
            activeTab === "boards"
              ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-500"
              : "text-slate-400 hover:text-slate-200"
          }`}>
          Boards
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`pb-3 font-semibold text-sm transition-colors relative cursor-pointer ${
            activeTab === "members"
              ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-500"
              : "text-slate-400 hover:text-slate-200"
          }`}>
          Members ({membersList.length})
        </button>
      </div>

      {/* TAB 1: BOARDS GRID */}
      {activeTab === "boards" && (
        <div className="space-y-4">
          {workspaceDetail?.boards && workspaceDetail.boards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaceDetail.boards.map((board: BoardOverview) => (
                <BoardCard key={board.id} board={board} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-slate-400">
              <p className="text-sm font-medium">Chưa có board nào</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEMBERS MANAGEMENT */}
      {activeTab === "members" && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-200">Current Members</h2>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500 text-sm text-white rounded-xl pl-9 pr-4 py-2 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          {memberPages.length > 0 ? (
            <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 scrollbar-thin scrollbar-thumb-slate-700">
              {memberPages.map((pageMembers, pageIndex) => (
                <div
                  key={pageIndex}
                  className="w-full shrink-0 snap-start grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  {pageMembers.map((member: WorkspaceMember) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl hover:border-slate-700 transition-all select-none">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative shrink-0">
                          <UserAvatar name={member.user?.name} type="chat" />
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 bg-emerald-500" />
                        </div>
                        <div className="truncate">
                          <h3 className="font-semibold text-white text-sm flex items-center gap-1.5 truncate">
                            <span className="truncate">{member.user?.name}</span>
                            {member.role === "OWNER" && (
                              <span className="text-xs text-amber-400 font-normal shrink-0">
                                (Owner)
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-slate-400 truncate">
                            {member.role || "Member"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full border text-emerald-400 border-emerald-500/20 bg-emerald-500/10">
                          • Online
                        </span>
                        <button className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              Không tìm thấy thành viên nào
            </div>
          )}

          {/* Invite Section */}
          <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              Invite New Members
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Add your email address..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 text-sm text-white rounded-xl px-4 py-2.5 outline-none transition-all placeholder:text-slate-500"
              />
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap cursor-pointer">
                Send Invites
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo Board */}
      <CreateBoardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaceMembers={membersList}
        onCreateBoard={handleCreateBoardSubmit}
      />
    </main>
  );
};

export default ContentMain;
