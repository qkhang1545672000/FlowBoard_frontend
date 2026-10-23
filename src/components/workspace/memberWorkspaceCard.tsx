/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { WorkspaceMember } from "@/types/workSpace";
import UserAvatar from "../ui/UserAvatar";
import { Crown, Loader2, MoreHorizontal, MessageSquare, UserX } from "lucide-react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import {
  useUpdateRoleForWorkspaceMember,
  useRemoveMemberWorkspace,
} from "@/hooks/useWorkSpace";
import { WorkspaceRole } from "@/types";
import { useWorkspacePermission } from "./useWorkspacePermission";
import { useAuthStore } from "@/store/useAuthStore";

interface Props {
  member: WorkspaceMember;
}

const MemberWorkspaceCard = ({ member }: Props) => {
  const [isLoadingRole, setIsLoadingRole] = useState(false);
  const [isLoadingRemove, setIsLoadingRemove] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId) ?? "";
  const { mutateAsync: updateRole } = useUpdateRoleForWorkspaceMember(workspaceId);
  const { mutateAsync: removeMember } = useRemoveMemberWorkspace(workspaceId);
  const { isOwn } = useWorkspacePermission(workspaceId);

  const isCurrentLeader = member.role === WorkspaceRole.LEADER_WORKSPACE;
  const user = useAuthStore((state) => state.user);
  const isSelf = member.user.id === user?.id;

  // Lắng nghe sự kiện click bên ngoài để đóng menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleLeader = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (member.role === WorkspaceRole.OWNER) return;

    const newRole = isCurrentLeader
      ? WorkspaceRole.MEMBER_WORKSPACE
      : WorkspaceRole.LEADER_WORKSPACE;

    try {
      setIsLoadingRole(true);
      await updateRole({ workspaceId, userId: member.user.id, role: newRole });
    } catch (error) {
      console.error("Lỗi khi cập nhật role:", error);
    } finally {
      setIsLoadingRole(false);
    }
  };

  const handleChat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    console.log("Mở khung chat với:", member.user.name);
  };

  const handleRemoveMember = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);

    if (member.role === WorkspaceRole.OWNER || isSelf) return;

    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa thành viên "${member.user?.name}" khỏi workspace này không?`,
    );

    if (!confirmDelete) return;

    try {
      setIsLoadingRemove(true);
      await removeMember({ workspaceId, userId: member.user.id });
      alert(`Đã xóa thành công ${member.user?.name} khỏi workspace.`);
    } catch (error) {
      console.error("Lỗi khi xóa thành viên:", error);
      alert("Không thể xóa thành viên này. Vui lòng thử lại sau.");
    } finally {
      setIsLoadingRemove(false);
    }
  };

  return (
    <div
      className={`group relative flex items-center justify-between gap-2 p-2 rounded-xl transition-all border ${
        isCurrentLeader
          ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
          : "hover:bg-slate-800/50 border-transparent hover:border-slate-800"
      }`}>
      {/* Thông tin chính của thành viên */}
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-1">
        <div className="relative shrink-0">
          <UserAvatar name={member.user?.name} type="chat" />
          {/* Chấm trạng thái online/offline cập nhật trực tiếp realtime qua cache */}
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
              member.user?.isOnline ? "bg-emerald-500" : "bg-slate-600"
            }`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-white truncate max-w-[120px]">
              {member.user?.name}
            </span>

            {/* Huy hiệu Leader nhỏ */}
            {isCurrentLeader && (
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 text-[9px] font-bold rounded-full flex items-center gap-0.5 shrink-0">
                <Crown className="w-2.5 h-2.5" /> Leader
              </span>
            )}

            {/* Huy hiệu "Bạn" */}
            {isSelf && (
              <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold rounded-md shrink-0">
                Bạn
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 truncate w-full">
            {member.user?.email}
          </p>
        </div>
      </div>

      {/* Nhóm thông tin bên phải */}
      <div className="flex items-center gap-1 shrink-0 relative" ref={menuRef}>
        {member.role === WorkspaceRole.OWNER && (
          <span className="text-[10px] text-amber-400 font-semibold px-1">Owner</span>
        )}

        {/* NÚT LEADER (VƯƠNG MIỆN) */}
        {isOwn && member.role !== WorkspaceRole.OWNER && (
          <button
            type="button"
            disabled={isLoadingRole || isLoadingRemove}
            onClick={handleToggleLeader}
            title={isCurrentLeader ? "Hủy trạng thái Leader" : "Chỉ định làm Leader"}
            className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
              isCurrentLeader
                ? "opacity-100 text-amber-400 bg-amber-500/20 border border-amber-500/30"
                : "opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-400 hover:bg-slate-800"
            }`}>
            {isLoadingRole ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Crown className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* --- NÚT 3 CHẤM --- */}
        {member.user.id !== user?.id && (
          <div
            className={`transition-all duration-200 overflow-hidden flex items-center justify-center ${
              isMenuOpen
                ? "w-7 opacity-100"
                : "w-0 opacity-0 group-hover:w-7 group-hover:opacity-100"
            }`}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen((prev) => !prev);
              }}
              title="Tùy chọn"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center shrink-0">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Submenu Dropdown */}
        {isMenuOpen && (
          <div className="absolute right-0 top-9 w-36 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs text-slate-300 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
            <button
              type="button"
              onClick={handleChat}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700/60 hover:text-white transition-colors text-left">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Nhắn tin</span>
            </button>

            {isOwn && member.role !== WorkspaceRole.OWNER && !isSelf && (
              <button
                type="button"
                disabled={isLoadingRemove}
                onClick={handleRemoveMember}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 hover:text-red-400 text-red-400 transition-colors text-left border-t border-slate-700/50">
                {isLoadingRemove ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                ) : (
                  <UserX className="w-3.5 h-3.5" />
                )}
                <span>Xóa thành viên</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberWorkspaceCard;
