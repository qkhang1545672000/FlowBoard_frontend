import React from "react";
import { MemberBoard } from "@/types/board";
import { WorkspaceMember } from "@/types/workSpace";
import { Check } from "lucide-react";

interface Props {
  member: MemberBoard | WorkspaceMember;
  isSelected?: boolean; // Thay thế cho selectedUserId cũ
  selectedUserId?: string | null; // Giữ lại để tương thích ngược nếu cần
  setSelectedUserId?: any; // Giữ lại để tương thích ngược nếu cần
}

const CardMember = ({ member, isSelected = false }: Props) => {
  // Lấy thông tin user an toàn (vì cấu trúc của bạn có thể là member.user hoặc trực tiếp member)
  const userName = (member as any).user?.name || (member as any).name || "Thành viên";
  const userEmail = (member as any).user?.email || (member as any).email || "";

  // Tạo chữ cái đầu cho Avatar
  const avatarInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
        isSelected
          ? "bg-indigo-900/40 border-indigo-500 text-white shadow-sm"
          : "bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700"
      }`}>
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-8 h-8 rounded-full bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 font-semibold flex items-center justify-center text-xs flex-shrink-0">
          {avatarInitials}
        </div>
        <div className="overflow-hidden">
          <div className="text-sm font-medium text-slate-200 truncate">{userName}</div>
          <div className="text-xs text-slate-400 truncate">{userEmail}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-400 font-medium">
          {member.role}
        </span>

        {/* Checkbox chọn nhiều */}
        <div
          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
            isSelected
              ? "border-cyan-400 bg-cyan-400 text-slate-950"
              : "border-slate-600 bg-slate-900/50"
          }`}>
          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>
      </div>
    </div>
  );
};

export default CardMember;
