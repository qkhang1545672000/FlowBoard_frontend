import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PaginatedWorkspaceResponse,
  workSpaceService,
} from "@/services/workspace.service";
import { WorkspaceDetailRespone, WorkspaceResponse } from "@/types/workSpace";
import { CreateWorkspaceDto } from "@/types/apiWorkspace.type";

import { useInfiniteQuery } from "@tanstack/react-query";

export const useWorkSpace = (limit: number = 10) => {
  return useInfiniteQuery<PaginatedWorkspaceResponse>({
    queryKey: ["workspace"],
    queryFn: ({ pageParam = 1 }) =>
      workSpaceService.getWorkSpace(pageParam as number, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // Nếu còn dữ liệu (hasMore = true), trang tiếp theo sẽ là page hiện tại + 1
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
  });
};
export const useWorkspaceDetail = (workspaceId: string) => {
  return useQuery<WorkspaceDetailRespone>({
    queryKey: ["workspace", workspaceId], // Query key bao gồm workspaceId để tự động refetch khi ID thay đổi
    queryFn: () => workSpaceService.getWorkspaceDetail(workspaceId),
    enabled: !!workspaceId, // Chỉ chạy query khi workspaceId có giá trị (tránh gọi API khi ID bị undefined/null)
  });
};
export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Hàm thực thi API tạo mới
    mutationFn: (newWorkspace: CreateWorkspaceDto) =>
      workSpaceService.createWorkspace(newWorkspace),

    // Chạy khi API thành công
    onSuccess: () => {
      // Làm mới (refetch) lại danh sách workspaces để cập nhật giao diện ngay lập tức
      // Thay "workspaces" bằng queryKey mà bạn đang dùng trong hook fetch danh sách
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },

    // Chạy khi API thất bại
    onError: (error) => {
      console.error("Lỗi khi tạo mới workspace:", error);
      // Bạn có thể thêm Toast notification thông báo lỗi ở đây
    },
  });
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Hàm thực thi API tạo mới
    mutationFn: (newWorkspaceId: string) =>
      workSpaceService.deleteWorkspace(newWorkspaceId),

    // Chạy khi API thành công
    onSuccess: () => {
      // Làm mới (refetch) lại danh sách workspaces để cập nhật giao diện ngay lập tức
      // Thay "workspaces" bằng queryKey mà bạn đang dùng trong hook fetch danh sách
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },

    // Chạy khi API thất bại
    onError: (error) => {
      console.error("Lỗi khi xóa delete workspace:", error);
      // Bạn có thể thêm Toast notification thông báo lỗi ở đây
    },
  });
};

export const useInviteMemberW = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Hàm thực thi API mời thành viên
    mutationFn: ({ workspaceId, email }: { workspaceId: string; email: string }) =>
      workSpaceService.inviteMemberWorkspace(workspaceId, email),

    // Chạy khi API thành công
    onSuccess: () => {
      // Làm mới (refetch) lại dữ liệu/danh sách workspace
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },

    // Chạy khi API thất bại
    onError: (error) => {
      console.error("Lỗi khi mời thành viên vào workspace:", error);
    },
  });
};
