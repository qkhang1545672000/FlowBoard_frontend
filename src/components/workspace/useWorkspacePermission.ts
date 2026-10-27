import { useMemo } from "react";

import { useAuthStore } from "@/store/useAuthStore"; // Zustand store lấy thông tin user hiện tại
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useWorkspaceDetail } from "@/hooks/useWorkSpace";
import { WorkspaceRole } from "@/types";

export const useWorkspacePermission = (workspaceId: string) => {
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);

  const { data: workspaceDetail, isLoading } = useWorkspaceDetail(
    activeWorkspaceId ?? "",
  );

  const user = useAuthStore((state) => state.user);

  const isOwn = useMemo(() => {
    if (!workspaceDetail?.members || !user?.id) return false;
    return workspaceDetail.members.some(
      (m) =>
        m.user?.id === user.id &&
        (m.role === WorkspaceRole.OWNER || m.role === WorkspaceRole.LEADER_WORKSPACE),
    );
  }, [workspaceDetail, user]);

  return { isOwn, workspaceDetail };
};
