import { Search, Mail, ChevronRight, ChevronLeft } from "lucide-react";
// đường dẫn tùy chỉnh theo dự án của bạn
import UserAvatar from "../ui/UserAvatar";
import MemberWorkspaceCard from "./memberWorkspaceCard";
import { WorkspaceMember } from "@/types/workSpace";

interface MemberSidebarProps {
  isOpen: boolean;
  onToggleOpen: (open: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredMembers: WorkspaceMember[];
  membersCount: number;
  inviteEmail: string;
  onInviteEmailChange: (email: string) => void;
}

export const MemberSidebar = ({
  isOpen,
  onToggleOpen,
  searchQuery,
  onSearchChange,
  filteredMembers,
  membersCount,
  inviteEmail,
  onInviteEmailChange,
}: MemberSidebarProps) => {
  return (
    <aside
      className={`border-l border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col transition-all duration-300 ${
        isOpen ? "w-80" : "w-12"
      }`}>
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        {isOpen ? (
          <>
            <span className="font-semibold text-sm text-white truncate">
              Thành viên ({membersCount})
            </span>
            <button
              onClick={() => onToggleOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Thu gọn Sidebar">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => onToggleOpen(true)}
            className="w-full flex justify-center text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Mở rộng Sidebar">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen ? (
        <div className="flex-1 flex flex-col min-h-0 p-3 space-y-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm thành viên..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
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
                onChange={(e) => onInviteEmailChange(e.target.value)}
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
  );
};
