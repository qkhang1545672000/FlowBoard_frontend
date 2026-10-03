import { useMemo } from "react";
import { useBoardDetail } from "@/hooks/useBoard"; // Hook lấy board detail của bạn
import { useAuthStore } from "@/store/useAuthStore"; // Zustand store lấy thông tin user hiện tại

export const useBoardPermission = (boardId: string) => {
  const { data: boardDetail } = useBoardDetail(boardId);
  const user = useAuthStore((state) => state.user);

  const isOwn = useMemo(() => {
    if (!boardDetail?.members || !user?.id) return false;
    return boardDetail.members.some(
      (m) => m.user?.id === user.id && (m.role === "ADMIN" || m.role === "LEADER"),
    );
  }, [boardDetail, user]);

  return { isOwn, boardDetail };
};
