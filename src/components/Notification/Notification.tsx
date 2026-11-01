"use client";

import {
  CheckCircle2,
  MessageSquare,
  Clock,
  Building2,
  BellRing,
  UserPlus,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useAcceptMemberW } from "@/hooks/useWorkSpace";

export interface NotificationItem {
  id: string;
  type: "activity" | "chat" | "task" | "workspace" | "system" | "invite";
  title: string;
  time: string;
  unread: boolean;
  metadata?: {
    token?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

interface Props {
  item: NotificationItem;
  onMarkAsRead?: () => void;
}

export default function NotificationCard({ item, onMarkAsRead }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Trạng thái theo dõi sau khi bấm chấp nhận
  const [isAccepted, setIsAccepted] = useState(false);
  const [displayTitle, setDisplayTitle] = useState(item.title);

  const { mutate: acceptMember, isPending } = useAcceptMemberW();

  const handleClick = () => {
    setIsExpanded((prev) => !prev);

    if (item.unread && onMarkAsRead) {
      onMarkAsRead();
    }
  };

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = item.metadata?.token;

    if (!token) {
      alert("Không tìm thấy token lời mời hợp lệ!");
      return;
    }

    acceptMember(token, {
      onSuccess: () => {
        setIsAccepted(true);
        setDisplayTitle("Bạn đã chấp nhận lời mời tham gia Workspace");
        if (onMarkAsRead) onMarkAsRead();
      },
      onError: (error: any) => {
        alert(error?.response?.data?.message || "Có lỗi xảy ra khi chấp nhận lời mời.");
      },
    });
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead();
    }
  };

  const renderIcon = () => {
    switch (item.type) {
      case "chat":
        return <MessageSquare className="w-3.5 h-3.5 text-sky-400" />;
      case "task":
        return <Clock className="w-3.5 h-3.5 text-amber-400" />;
      case "workspace":
        return <Building2 className="w-3.5 h-3.5 text-indigo-400" />;
      case "system":
        return <BellRing className="w-3.5 h-3.5 text-purple-400" />;
      case "invite":
        return <UserPlus className="w-3.5 h-3.5 text-emerald-400" />;
      case "activity":
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
        item.unread
          ? "bg-indigo-950/30 border-indigo-500/30 text-slate-200"
          : "bg-slate-800/30 border-slate-800/60 text-slate-400"
      }`}>
      <div className="shrink-0 p-1 bg-slate-800/60 rounded-lg mt-0.5">{renderIcon()}</div>

      <div className="flex-1 overflow-hidden space-y-2">
        <p
          className={`text-[11px] font-medium leading-tight transition-all ${
            isExpanded ? "whitespace-normal line-clamp-none" : "truncate"
          }`}>
          {displayTitle}
        </p>

        {isExpanded && (
          <span className="text-[9px] text-slate-500 block animate-in fade-in duration-200">
            {item.time}
          </span>
        )}

        {/* Chỉ hiển thị nút khi là loại invite, đang mở rộng và CHƯA bấm chấp nhận */}
        {item.type === "invite" && isExpanded && !isAccepted && (
          <div className="flex items-center gap-2 pt-1 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              disabled={isPending}
              onClick={handleAccept}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[10px] font-semibold rounded-lg shadow-sm transition">
              {isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Check className="w-3 h-3" />
              )}
              Chấp nhận
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleReject}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 text-[10px] font-semibold rounded-lg border border-slate-700 transition">
              <X className="w-3 h-3" /> Từ chối
            </button>
          </div>
        )}

        {/* Trạng thái hiển thị sau khi đã chấp nhận thành công */}
        {isAccepted && isExpanded && (
          <div className="text-[10px] font-medium text-emerald-400 flex items-center gap-1 pt-1">
            <CheckCircle2 className="w-3 h-3" /> Đã tham gia Workspace
          </div>
        )}
      </div>

      {item.unread && (
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0 mt-1.5" />
      )}
    </div>
  );
}
