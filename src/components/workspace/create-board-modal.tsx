"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Check,
  Users,
  Layout,
  Search,
  UserCheck,
  MoreVertical,
  Crown,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { WorkspaceMember } from "@/types/workSpace";
import UserAvatar from "../ui/UserAvatar";
import { useAuthStore } from "@/store/useAuthStore";
import { useCreateBoard } from "@/hooks/useBoard";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

interface SelectedMemberData {
  member: WorkspaceMember;
  isLeader: boolean;
}

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceMembers: WorkspaceMember[];
  currentUserId?: string;
  onCreateBoard?: (data: {
    title: string;
    description: string;
    memberIds: string[];
    leaderId: string | null;
  }) => void;
}

export const CreateBoardModal = ({
  isOpen,
  onClose,
  workspaceMembers,
  currentUserId,
  onCreateBoard,
}: CreateBoardModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembersMap, setSelectedMembersMap] = useState<
    Map<string, { isLeader: boolean }>
  >(new Map());
  const [searchMember, setSearchMember] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { mutate: createBoard, isPending } = useCreateBoard();
  const user = useAuthStore((state) => state.user);
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId) ?? "";
  const modalRef = useRef<HTMLDivElement>(null);

  // Tìm WorkspaceMember tương ứng với người dùng hiện tại (Owner)
  const currentWorkspaceMember = workspaceMembers.find(
    (m) => (user?.id && m.user.id === user.id) || m.id === currentUserId,
  );

  // Khởi tạo mặc định: Thêm người tạo vào danh sách nhưng không gán isLeader
  useEffect(() => {
    if (isOpen && currentWorkspaceMember) {
      setSelectedMembersMap(new Map([[currentWorkspaceMember.id, { isLeader: false }]]));
    }
  }, [isOpen, currentWorkspaceMember?.id]);

  // Đóng modal khi click ra ngoài
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Click ra ngoài để đóng menu ba chấm
  useEffect(() => {
    const handleClickOutsideMenu = () => setOpenMenuId(null);
    if (openMenuId) {
      window.addEventListener("click", handleClickOutsideMenu);
    }
    return () => {
      window.removeEventListener("click", handleClickOutsideMenu);
    };
  }, [openMenuId]);

  if (!isOpen) return null;

  // Toggle chọn / bỏ chọn thành viên (Không áp dụng cho Người tạo)
  const toggleMember = (id: string) => {
    if (id === currentWorkspaceMember?.id) return; // Người tạo không thể bị xóa

    setSelectedMembersMap((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(id)) {
        newMap.delete(id);
      } else {
        newMap.set(id, { isLeader: false });
      }
      return newMap;
    });
  };

  // Toggle vai trò Leader (Chỉ 1 người làm leader)
  const toggleLeaderRole = (id: string) => {
    setSelectedMembersMap((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(id);

      if (!current) return prev;

      if (current.isLeader) {
        newMap.set(id, { isLeader: false });
      } else {
        newMap.forEach((val, key) => {
          newMap.set(key, { isLeader: key === id });
        });
      }
      return newMap;
    });
  };

  const currentLeaderId = Array.from(selectedMembersMap.entries()).find(
    ([_, val]) => val.isLeader,
  )?.[0];

  const filteredWorkspaceMembers = workspaceMembers.filter(
    (m) =>
      m.user.name?.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.user.email?.toLowerCase().includes(searchMember.toLowerCase()),
  );

  const selectedMembersList: SelectedMemberData[] = Array.from(selectedMembersMap.keys())
    .map((id) => {
      const member = workspaceMembers.find((m) => m.id === id);
      const isLeader = selectedMembersMap.get(id)?.isLeader || false;
      return member ? { member, isLeader } : null;
    })
    .filter((item): item is SelectedMemberData => item !== null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const memberIds = Array.from(selectedMembersMap.keys());
    const leaderId = currentLeaderId || null;
    createBoard({ title, description, memberIds, leaderId, workspaceId });

    // Reset Form
    setTitle("");
    setDescription("");
    setSelectedMembersMap(new Map());
    onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] max-h-[700px] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Tạo Board Mới</h2>
              <p className="text-xs text-slate-400">
                Nhập thông tin board và phân công vai trò đội trưởng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden">
          {/* Cột trái: Form & Thành viên đã chọn */}
          <div className="col-span-2 flex flex-col h-full overflow-hidden">
            <div className="p-1 border-b border-slate-800 space-y-4 shrink-0 bg-slate-900/20">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tên Board <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên board..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 text-sm text-white rounded-xl px-4 py-2.5 outline-none transition-all placeholder:text-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Mô tả
                </label>
                <textarea
                  placeholder="Nhập mô tả..."
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 text-sm text-white rounded-xl p-3 outline-none transition-all placeholder:text-slate-500 resize-none"
                />
              </div>
            </div>

            {/* Danh sách người tham gia */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950 p-6">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Thành viên sẽ tham gia Board
                </h3>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {selectedMembersList.length} thành viên
                </span>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
                {selectedMembersList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedMembersList.map(({ member, isLeader }) => {
                      const isOwner = member.id === currentWorkspaceMember?.id;

                      return (
                        <div
                          key={member.id}
                          className={`relative flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                            isLeader
                              ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
                              : isOwner
                                ? "bg-indigo-950/30 border-indigo-500/30 shadow-sm" // Khung viền riêng biệt cho Owner
                                : "bg-slate-900/70 border-slate-800/80"
                          }`}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative shrink-0">
                              <UserAvatar name={member.user.name} type="chat" />
                              {isLeader && (
                                <Crown className="w-3.5 h-3.5 text-amber-400 absolute -top-1.5 -right-1.5 fill-amber-400" />
                              )}
                            </div>
                            <div className="truncate">
                              <div className="flex items-center gap-1.5 truncate">
                                <p className="text-xs font-semibold text-white truncate">
                                  {member.user.name}
                                </p>

                                {/* Badge Chủ sở hữu */}
                                {isOwner && (
                                  <span className="text-[10px] font-medium px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded shrink-0 flex items-center gap-0.5">
                                    <ShieldCheck className="w-2.5 h-2.5" /> Owner
                                  </span>
                                )}

                                {/* Badge Đội trưởng */}
                                {isLeader && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded shrink-0">
                                    Leader
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 truncate">
                                {member.user.email}
                              </p>
                            </div>
                          </div>

                          {/* Menu / Nút thao tác */}
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(
                                    openMenuId === member.id ? null : member.id,
                                  );
                                }}
                                className={`p-1 rounded-lg transition-colors ${
                                  openMenuId === member.id
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                                }`}>
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {openMenuId === member.id && (
                                <div
                                  className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-20 py-1"
                                  onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    disabled={!isLeader && currentLeaderId !== undefined}
                                    onClick={() => {
                                      toggleLeaderRole(member.id);
                                      setOpenMenuId(null);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                                      !isLeader && currentLeaderId !== undefined
                                        ? "opacity-40 cursor-not-allowed text-slate-500"
                                        : "hover:bg-slate-800 text-slate-200"
                                    }`}>
                                    <span className="flex items-center gap-1.5">
                                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                                      {isLeader ? "Bỏ Đội trưởng" : "Chọn Đội trưởng"}
                                    </span>
                                    {isLeader && (
                                      <Check className="w-3 h-3 text-amber-400" />
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Người tạo board bị khóa không thể bị xóa */}
                            {isOwner ? (
                              <span
                                className="p-1 text-slate-500"
                                title="Người tạo board (Cố định)">
                                <Lock className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleMember(member.id)}
                                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                                title="Xóa khỏi board">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full border border-dashed border-slate-800/80 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-500 text-center">
                    <Users className="w-8 h-8 mb-2 opacity-40 text-indigo-400" />
                    <p className="text-xs font-medium">Chưa chọn thành viên nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cột phải: Danh sách thành viên Workspace */}
          <div className="col-span-1 flex flex-col h-full bg-slate-900/30 overflow-hidden">
            <div className="p-4 border-b border-slate-800 space-y-3 shrink-0 bg-slate-900/40">
              <h3 className="text-sm font-semibold text-slate-200">
                Thành viên Workspace
              </h3>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm thành viên..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white rounded-xl pl-8 pr-3 py-2 outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
              {filteredWorkspaceMembers.length > 0 ? (
                filteredWorkspaceMembers.map((member) => {
                  const isSelected = selectedMembersMap.has(member.id);
                  const isOwner = member.id === currentWorkspaceMember?.id;

                  return (
                    <div
                      key={member.id}
                      onClick={() => !isOwner && toggleMember(member.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isOwner
                          ? "bg-indigo-950/20 border-indigo-500/30 opacity-75 cursor-not-allowed" // Khung nhã nhặn cho Owner ở cột phải
                          : isSelected
                            ? "bg-indigo-600/15 border-indigo-500/50 text-white cursor-pointer"
                            : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900 cursor-pointer"
                      }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar name={member.user.name} type="chat" />
                        <div className="truncate">
                          <p className="text-xs font-semibold truncate flex items-center gap-1">
                            {member.user.name}
                            {isOwner && (
                              <span className="text-[10px] text-indigo-400 font-normal">
                                (Bạn)
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {member.role}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ml-2 transition-all ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-500 text-white"
                            : "border-slate-700 bg-slate-950 text-transparent"
                        }`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  Không tìm thấy thành viên
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20">
            Tạo Board
          </button>
        </div>
      </div>
    </div>
  );
};
