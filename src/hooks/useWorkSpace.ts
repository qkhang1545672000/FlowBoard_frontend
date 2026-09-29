import { useQuery } from "@tanstack/react-query";
import { workSpaceService } from "@/services/workspace.service";
import { WorkspaceDetailRespone, WorkspaceResponse } from "@/types/workSpace";

export const useWorkSpace = () => {
  return useQuery<WorkspaceResponse[]>({
    queryKey: ["workspace"],
    queryFn: () => workSpaceService.getWorkSpace(),
  });
};

export const useWorkspaceDetail = (workspaceId: string) => {
  return useQuery<WorkspaceDetailRespone>({
    queryKey: ["workspace", workspaceId], // Query key bao gồm workspaceId để tự động refetch khi ID thay đổi
    queryFn: () => workSpaceService.getWorkspaceDetail(workspaceId),
    enabled: !!workspaceId, // Chỉ chạy query khi workspaceId có giá trị (tránh gọi API khi ID bị undefined/null)
  });
};
