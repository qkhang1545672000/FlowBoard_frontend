/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Search, X, Crown } from "lucide-react";
import { Task, TaskMember } from "@/types/column";
import CardMember from "../cardMember";
import { useBoardStore } from "@/store/useBoardStore";
import { useBoardDetail } from "@/hooks/useBoard";
import { useUpdateAssignTask } from "@/hooks/useTask";
import { User } from "@/types/api.types";
import UserAvatar from "@/components/ui/UserAvatar";
import { LoadingModal } from "@/components/ui/loading-modal";

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onAssign?: (userIds: string[], leaderId?: string) => void;
}

export function AssignTaskModal({
  isOpen,
  onClose,
  task,
  onAssign,
}: AssignTaskModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const boardId = useBoardStore((state) => state.activeBoardId) ?? "";
  const { data: BoardDetail } = useBoardDetail();
  const { mutate: updateAssignTask, isPending } = useUpdateAssignTask(boardId);

  // Khởi tạo danh sách các User đã chọn từ task ban đầu
  const [selectedUsers, setSelectedUsers] = useState<User[]>(() => {
    if (task.members && Array.isArray(task.members)) {
      const users = task.members.map((m: TaskMember) => m.user);
      // Tìm leader ban đầu để đưa lên đầu danh sách ngay từ lúc khởi tạo nếu có
      const foundLeader = task.members.find(
        (m: any) => m.isLeader || m.role === "LEADER",
      );
      if (foundLeader) {
        const leaderUser = foundLeader.user;
        const others = users.filter((u) => u.id !== leaderUser.id);
        return [leaderUser, ...others];
      }
      return users;
    }
    return [];
  });

  // Lưu ID của Leader Task
  const [leaderId, setLeaderId] = useState<string | null>(() => {
    if (task.members && task.members.length > 0) {
      const foundLeader = task.members.find(
        (m: any) => m.isLeader || m.role === "LEADER",
      );
      return foundLeader ? foundLeader.user.id : task.members[0]?.user?.id || null;
    }
    return null;
  });

  // 🟢 Hàm phụ trợ sắp xếp lại danh sách: Leader luôn đứng đầu tiên
  const sortUsersWithLeader = (users: User[], currentLeaderId: string | null) => {
    if (!currentLeaderId) return users;
    const leaderIndex = users.findIndex((u) => u.id === currentLeaderId);
    if (leaderIndex <= 0) return users; // Đã ở đầu hoặc không tìm thấy
    const leader = users[leaderIndex];
    const others = users.filter((u) => u.id !== currentLeaderId);
    return [leader, ...others];
  };

  // 🟢 Hàm xử lý khi thay đổi Leader: Cập nhật state leaderId và tự động đẩy lên đầu danh sách
  const handleSetLeader = (userId: string) => {
    setLeaderId(userId);
    setSelectedUsers((prev) => sortUsersWithLeader(prev, userId));
  };

  if (!isOpen || typeof window === "undefined") return null;

  const filterBySearch = (member: any) => {
    const query = searchQuery.toLowerCase();
    const name = member.user?.name?.toLowerCase() || "";
    const email = member.user?.email?.toLowerCase() || "";
    return name.includes(query) || email.includes(query);
  };

  const filteredProjectMembers = BoardDetail?.members?.filter(filterBySearch) || [];

  const handleToggleSelect = (user: User) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      if (exists) {
        // Nếu bỏ chọn thành viên đang là leader
        let newLeaderId = leaderId;
        if (leaderId === user.id) {
          const remaining = prev.filter((u) => u.id !== user.id);
          newLeaderId = remaining.length > 0 ? remaining[0].id : null;
          setLeaderId(newLeaderId);
        }
        const filtered = prev.filter((u) => u.id !== user.id);
        return sortUsersWithLeader(filtered, newLeaderId);
      } else {
        // Nếu chọn thêm thành viên mới
        const newList = [...prev, user];
        let newLeaderId = leaderId;
        if (!leaderId) {
          newLeaderId = user.id;
          setLeaderId(newLeaderId);
        }
        return sortUsersWithLeader(newList, newLeaderId);
      }
    });
  };

  const handleAssign = () => {
    const userIds = selectedUsers.map((u) => u.id);
    console.log("selectedUserIds:", userIds, "leaderId:", leaderId);

    updateAssignTask(
      {
        taskId: task.id,
        userIds,
        leaderId: leaderId ?? "",
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  if (isPending) {
    return <LoadingModal isOpen={isPending} message="Đang cập nhật phân công" />;
  }

  return createPortal(
    <div
      onClick={onClose}
      onMouseDown={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-[#1b2230] border border-slate-700/85 rounded-2xl w-full max-w-md max-h-[85vh] shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Header (Cố định) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Phân công công việc
            </h3>
            <p className="text-xs text-slate-400 truncate max-w-[320px]">{task.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg transition-colors hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung chính cuộn độc lập */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {/* KHU VỰC HIỂN THỊ CHIPS CÁC THÀNH VIÊN ĐÃ CHỌN */}
          {selectedUsers.length > 0 && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2 shrink-0">
              <div className="text-xs font-medium text-slate-400">
                Đã chọn ({selectedUsers.length}):
              </div>
              <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto custom-scrollbar pr-1">
                {selectedUsers.map((user) => {
                  const isLeader = leaderId === user.id;
                  return (
                    <div
                      key={user.id}
                      className={`group relative flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full text-xs font-medium border transition-all ${
                        isLeader
                          ? "bg-amber-950/60 border-amber-500/50 text-amber-200"
                          : "bg-indigo-950/60 border-indigo-500/30 text-indigo-200 hover:border-amber-500/40"
                      }`}>
                      {/* Avatar kèm icon vương miện đè góc nếu là leader */}
                      <div className="relative">
                        <UserAvatar type="min" avatarUrl={user.image} name={user.name} />
                        {isLeader && (
                          <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow">
                            <Crown className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>

                      {/* Tên thành viên gọn gàng */}
                      <span className="max-w-[80px] truncate">{user.name}</span>

                      {/* Nút set nhanh làm leader khi hover (nếu chưa phải leader) */}
                      {!isLeader && (
                        <button
                          type="button"
                          onClick={() => handleSetLeader(user.id)}
                          title="Chọn làm Leader"
                          className="hidden group-hover:flex items-center text-amber-400 hover:text-amber-300 p-0.5 transition-colors">
                          <Crown className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Nút bỏ chọn (X) */}
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(user)}
                        className="hover:text-white transition-colors ml-0.5 text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Thanh tìm kiếm */}
          <div className="relative shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm thành viên trong Board..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Danh sách thành viên trong Board */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-400 px-1">
              Thành viên thuộc Board ({filteredProjectMembers.length})
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {filteredProjectMembers.length > 0 ? (
                filteredProjectMembers.map((member) => {
                  const isSelected = selectedUsers.some((u) => u.id === member.user.id);
                  const isLeader = leaderId === member.user.id;
                  return (
                    <div
                      key={member.id}
                      onClick={() => handleToggleSelect(member.user)}
                      className="cursor-pointer">
                      <CardMember
                        member={member}
                        isSelected={isSelected}
                        isLeader={isLeader}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  Không tìm thấy thành viên nào phù hợp
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer (Cố định) */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/40 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors">
            Hủy
          </button>
          <button
            onClick={() => {
              handleAssign();
            }}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition-all">
            Áp dụng
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
