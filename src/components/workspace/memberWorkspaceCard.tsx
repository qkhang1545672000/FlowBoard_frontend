"use client";

import { useState } from "react";
import { WorkspaceMember } from "@/types/workSpace";
import UserAvatar from "../ui/UserAvatar";
import { Crown, Loader2 } from "lucide-react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useUpdateRoleForWorkspaceMember } from "@/hooks/useWorkSpace";
import { WorkspaceRole } from "@/types";
import { useWorkspacePermission } from "./useWorkspacePermission";

interface Props {
  member: WorkspaceMember;
}

const MemberWorkspaceCard = ({ member }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId) ?? "";
  const { mutateAsync: updateRole } = useUpdateRoleForWorkspaceMember(workspaceId);
  const { isOwn } = useWorkspacePermission(workspaceId);
  // Kiểm tra xem thành viên này có đang là Leader không dựa vào dữ liệu thực tế
  const isCurrentLeader = member.role === WorkspaceRole.LEADER_WORKSPACE;

  // Xử lý khi người dùng bấm vào nút vương miện
  const handleToggleLeader = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Không cho phép thay đổi nếu là Owner
    if (member.role === WorkspaceRole.OWNER) return;

    // Xác định role mới: Nếu đang là leader thì hủy về member, ngược lại thì lên leader
    const newRole = isCurrentLeader
      ? WorkspaceRole.MEMBER_WORKSPACE
      : WorkspaceRole.LEADER_WORKSPACE;

    try {
      setIsLoading(true);
      await updateRole({ workspaceId, userId: member.user.id, role: newRole });
    } catch (error) {
      console.error("Lỗi khi cập nhật role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`group relative flex items-center justify-between gap-3 p-2 rounded-xl transition-all border ${
        isCurrentLeader
          ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
          : "hover:bg-slate-800/50 border-transparent hover:border-slate-800"
      }`}>
      {/* Thông tin chính của thành viên */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative shrink-0">
          <UserAvatar name={member.user?.name} type="chat" />
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
              member.user?.isOnline ? "bg-emerald-500" : "bg-slate-600"
            }`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white truncate">
              {member.user?.name}
            </span>
            {/* Huy hiệu Leader nhỏ */}
            {isCurrentLeader && (
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 text-[9px] font-bold rounded-full flex items-center gap-0.5 shrink-0">
                <Crown className="w-2.5 h-2.5" /> Leader
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 truncate">{member.user?.email}</p>
        </div>
      </div>

      {/* Nhóm thông tin bên phải (Vai trò Owner & Nút Leader hover) */}
      <div className="flex items-center gap-2 shrink-0">
        {member.role === WorkspaceRole.OWNER && (
          <span className="text-[10px] text-amber-400 font-semibold">Owner</span>
        )}

        {/* NÚT LEADER (VƯƠNG MIỆN): Chỉ hiện khi hover và không áp dụng trực tiếp cho Owner */}
        {isOwn && member.role !== WorkspaceRole.OWNER && (
          <button
            type="button"
            disabled={isLoading}
            onClick={handleToggleLeader}
            title={isCurrentLeader ? "Hủy trạng thái Leader" : "Chỉ định làm Leader"}
            className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
              isCurrentLeader
                ? "opacity-100 text-amber-400 bg-amber-500/20 border border-amber-500/30"
                : "opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-400 hover:bg-slate-800"
            }`}>
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Crown className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default MemberWorkspaceCard;
