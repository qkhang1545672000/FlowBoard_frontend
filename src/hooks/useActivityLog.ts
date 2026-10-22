import { useQuery } from "@tanstack/react-query";
import {
  activityLogService,
  QueryActivityLogParams,
} from "@/services/activity-log.service";

export const useActivityLogs = (
  params: QueryActivityLogParams,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["activity-logs", params],
    queryFn: () => activityLogService.getActivityLogs(params),
    enabled: enabled && !!params.boardId, // Chỉ fetch khi có boardId và modal được mở
    staleTime: 1000 * 60, // Cache trong 1 phút
  });
};
