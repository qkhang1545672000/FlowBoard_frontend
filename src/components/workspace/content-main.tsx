"use client";

import { useState } from "react";
import { Plus, Search, UserPlus, MoreVertical, Mail } from "lucide-react";
import { BoardCard } from "./board-card";
import { useWorkspaceDetail } from "@/hooks/useWorkSpace";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

// Mock data giả lập danh sách thành viên nếu API chưa trả về
const mockMembers = [
  {
    id: "m-1",
    name: "Thao Nguyen",
    email: "thao.nguyen@example.com",
    role: "Frontend Developer",
    status: "Online",
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    id: "m-2",
    name: "Minh Tran",
    email: "minh.tran@example.com",
    role: "Project Manager",
    status: "Online",
    avatar: "https://i.pravatar.cc/150?u=2",
  },
  {
    id: "m-3",
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    role: "Workspace Owner",
    status: "Online",
    avatar: "https://i.pravatar.cc/150?u=3",
  },
  {
    id: "m-4",
    name: "Anh Nguyen",
    email: "anh.nguyen@example.com",
    role: "Lead Designer",
    status: "Away",
    avatar: "https://i.pravatar.cc/150?u=4",
  },
  {
    id: "m-5",
    name: "Anh Nguyen",
    email: "anh.nguyen@example.com",
    role: "Lead Designer",
    status: "Away",
    avatar: "https://i.pravatar.cc/150?u=4",
  },
  {
    id: "m-6",
    name: "Anh Nguyen",
    email: "anh.nguyen@example.com",
    role: "Lead Designer",
    status: "Away",
    avatar: "https://i.pravatar.cc/150?u=4",
  },
  {
    id: "m-7",
    name: "Anh Nguyen",
    email: "anh.nguyen@example.com",
    role: "Lead Designer",
    status: "Away",
    avatar: "https://i.pravatar.cc/150?u=4",
  },
  {
    id: "m-8",
    name: "Anh Nguyen",
    email: "anh.nguyen@example.com",
    role: "Lead Designer",
    status: "Away",
    avatar: "https://i.pravatar.cc/150?u=4",
  },
  {
    id: "m-9",
    name: "Anh Nguyen",
    email: "anh.nguyen@example.com",
    role: "Lead Designer",
    status: "Away",
    avatar: "https://i.pravatar.cc/150?u=4",
  },
  {
    id: "m-10",
    name: "Anh Nguyen",
    email: "anh.nguyen@example.com",
    role: "Lead Designer",
    status: "Away",
    avatar: "https://i.pravatar.cc/150?u=4",
  },
  {
    id: "m-11",
    name: "Anh Nguyen",
    email: "anh.nguyen@example.com",
    role: "Lead Designer",
    status: "Away",
    avatar: "https://i.pravatar.cc/150?u=4",
  },
];

// Hàm chia mảng thành từng trang (Mỗi trang chứa tối đa 6 thành viên: 2 cột x 3 hàng)
const chunkArray = (array: any[], size: number) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const ContentMain = () => {
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const { data: workspaceDetail, isLoading } = useWorkspaceDetail(
    activeWorkspaceId ?? "",
  );

  const [activeTab, setActiveTab] = useState<"boards" | "members">("boards");
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  if (isLoading) return <div className="p-8 text-slate-400">Loading...</div>;

  const membersList = workspaceDetail?.members || mockMembers;
  const filteredMembers = membersList.filter(
    (m: any) =>
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Chia danh sách thành viên đã lọc thành từng trang (mỗi trang 6 phần tử)
  const memberPages = chunkArray(filteredMembers, 6);

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

        {/* Action Button theo Tab */}
        <div>
          {activeTab === "boards" ? (
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20">
              <Plus className="w-4 h-4" />
              <span>Create Board</span>
            </button>
          ) : (
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20">
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
          className={`pb-3 font-semibold text-sm transition-colors relative ${
            activeTab === "boards"
              ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-500"
              : "text-slate-400 hover:text-slate-200"
          }`}>
          Boards
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`pb-3 font-semibold text-sm transition-colors relative ${
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
              {workspaceDetail.boards.map((board: any) => (
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
          {/* Header & Search Bar */}
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

          {/* Members Container - Cuộn ngang lật theo trang (2 cột x 3 hàng) */}
          {memberPages.length > 0 ? (
            <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 scrollbar-thin scrollbar-thumb-slate-700">
              {memberPages.map((pageMembers, pageIndex) => (
                <div
                  key={pageIndex}
                  className="w-full shrink-0 snap-start grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  {pageMembers.map((member: any) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl hover:border-slate-700 transition-all select-none">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-11 h-11 rounded-full object-cover border border-slate-700"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                              member.status === "Online"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />
                        </div>
                        <div className="truncate">
                          <h3 className="font-semibold text-white text-sm flex items-center gap-1.5 truncate">
                            <span className="truncate">{member.name}</span>
                            {member.role?.includes("Owner") && (
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
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                            member.status === "Online"
                              ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                              : "text-amber-400 border-amber-500/20 bg-amber-500/10"
                          }`}>
                          • {member.status}
                        </span>
                        <button className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
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
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap">
                Send Invites
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ContentMain;
