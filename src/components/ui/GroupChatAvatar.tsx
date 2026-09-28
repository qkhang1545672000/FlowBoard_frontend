import type { Participant } from "@/types";
import UserAvatar from "./UserAvatar";

interface GroupChatAvatarProps {
  participants: Participant[];
  type: "chat" | "sidebar" | "min";
  maxVisible?: number; // Cho phép tùy chỉnh số avatar tối đa hiển thị (mặc định là 3)
}

const GroupChatAvatar = ({
  participants = [],
  type,
  maxVisible = 3,
}: GroupChatAvatarProps) => {
  const total = participants.length;
  const visibleParticipants = participants.slice(0, maxVisible);
  const remainingCount = total - maxVisible;

  // Tính toán kích thước cho badge "+N" dựa trên prop type
  const badgeSizeClass = type === "min" ? "size-7 text-xs" : "size-8 text-[10px]";

  return (
    <div className="relative flex -space-x-2.5 items-center">
      {visibleParticipants.map((member, index) => (
        <UserAvatar
          key={member._id || index}
          type={"min"}
          name={member.displayName}
          avatarUrl={member.avatarUrl ?? undefined}
          className="ring-2 ring-background transition-transform hover:z-20 hover:scale-105"
        />
      ))}

      {/* Hiển thị số lượng thành viên còn lại (ví dụ: +5) */}
      {remainingCount > 0 && (
        <div
          className={`flex items-center justify-center rounded-full bg-slate-800 text-slate-200 font-bold ring-2 ring-background z-10 shrink-0 ${badgeSizeClass}`}
          title={`${remainingCount} thành viên khác`}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default GroupChatAvatar;
