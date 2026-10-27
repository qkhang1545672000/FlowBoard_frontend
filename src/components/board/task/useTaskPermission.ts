import { useMemo } from "react";
import { useBoardDetail } from "@/hooks/useBoard";
import { useAuthStore } from "@/store/useAuthStore";

export const useTaskPermission = (boardId: string, taskId?: string) => {
  const { data: boardDetail } = useBoardDetail(boardId);
  const user = useAuthStore((state) => state.user);

  // Kiểm tra user hiện tại có phải là TASK_LEADER của task truyền vào hay không
  const isTaskLeader = useMemo(() => {
    if (!boardDetail?.columns || !user?.id || !taskId) return false;

    // Duyệt qua các columns và tasks để tìm task khớp với taskId
    for (const column of boardDetail.columns) {
      const task = column.tasks.find((t) => t.id === taskId);
      if (task) {
        // Kiểm tra trong danh sách members của task
        return task.members.some(
          (member) => member.userId === user.id && member.role === "TASK_LEADER",
        );
      }
    }

    return false;
  }, [boardDetail, user, taskId]);

  return { isTaskLeader, boardDetail };
};
