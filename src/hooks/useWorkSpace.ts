import { useQuery } from "@tanstack/react-query";
import { workSpaceService } from "@/services/workspace.service";
import { WorkspaceResponse } from "@/types/workSpace";

export const useWorkSpace = () => {
  return useQuery<WorkspaceResponse[]>({
    queryKey: ["workspace"],
    queryFn: () => workSpaceService.getWorkSpace(),
  });
};
