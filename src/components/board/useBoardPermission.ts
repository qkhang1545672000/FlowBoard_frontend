import { useMemo } from "react";
import { useBoardDetail } from "@/hooks/useBoard"; // Hook lấy board detail của bạn
import { useAuthStore } from "@/store/useAuthStore"; // Zustand store lấy thông tin user hiện tại
import { BoardMemberRole } from "@/types";

export const useBoardPermission = (boardId: string) => {
  const { data: boardDetail } = useBoardDetail(boardId);
  const user = useAuthStore((state) => state.user);

  const isOwn = useMemo(() => {
    if (!boardDetail?.members || !user?.id) return false;
    return boardDetail.members.some(
      (m) =>
        m.user?.id === user.id &&
        (m.role === BoardMemberRole.OWNER || m.role === BoardMemberRole.BOARD_LEADER),
    );
  }, [boardDetail, user]);

  return { isOwn, boardDetail };
};
