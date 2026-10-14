import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PaginatedWorkspaceResponse,
  WorkspaceFilterType,
  workSpaceService,
} from "@/services/workspace.service";
import { WorkspaceDetailResponse } from "@/types/workSpace";
import { CreateWorkspaceDto } from "@/types/apiWorkspace.type";

import { useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { WorkspaceRole } from "@/types";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useRouter } from "next/navigation";

export const useWorkSpace = (limit: number = 10, type: WorkspaceFilterType = "all") => {
  return useInfiniteQuery<PaginatedWorkspaceResponse>({
    queryKey: ["workspace", type], // Query key phụ thuộc vào `type`
    queryFn: ({ pageParam = 1 }) =>
      workSpaceService.getWorkSpace(pageParam as number, limit, type),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
  });
};
export const useWorkspaceDetail = (workspaceId: string) => {
  return useQuery<WorkspaceDetailResponse>({
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
    onError: (error: unknown) => {
      const message = (
        error as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message;

      toast.error(
        typeof message === "string" ? message : (message?.error ?? "Sign in failed"),
      );
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
      workSpaceService.inviteMemberWorkspace(
        workspaceId,
        email,
        WorkspaceRole.MEMBER_WORKSPACE,
      ),

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

export const useWorkspaceCounts = () => {
  return useQuery({
    queryKey: ["workspace-counts"],
    queryFn: async () => {
      // Gọi song song 2 API với limit = 1 để lấy giá trị `total` của cả 2 tab nhanh nhất
      const [ownedRes, joinedRes] = await Promise.all([
        workSpaceService.getWorkSpace(1, 1, "owned"),
        workSpaceService.getWorkSpace(1, 1, "joined"),
      ]);

      return {
        ownedCount: ownedRes.total || 0,
        joinedCount: joinedRes.total || 0,
      };
    },
  });
};

export const useAcceptMemberW = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const setWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);

  return useMutation({
    // Hàm thực thi gọi API chấp nhận lời mời thành viên
    mutationFn: (token: string) => workSpaceService.acceptMemberWorkspace(token),

    // Chạy khi API thành công (res trả về từ service)
    onSuccess: (data, token) => {
      if (data && data.success) {
        // Đã gia nhập thành công -> Xóa token tạm
        localStorage.removeItem("pending_invite_token");

        // Invalidate cache workspace để cập nhật danh sách workspace mới nhất
        queryClient.invalidateQueries({ queryKey: ["workspace"] });

        // Cập nhật workspace đang active
        setWorkspace({ id: data.workspaceId, slug: data.slug });

        toast.success("Tham gia Workspace thành công! Đang chuyển hướng...");

        setTimeout(() => {
          router.push(`/w/${data.slug}`);
        }, 1500);
      } else {
        toast.error(data?.message || "Lời mời không hợp lệ hoặc đã hết hạn.");
      }
    },

    // Chạy khi API thất bại hoặc lỗi mạng
    onError: (error: any, token) => {
      toast.error("Bạn cần đăng ký/đăng nhập để gia nhập Workspace.");

      setTimeout(() => {
        router.push(`/auth/signin?redirect=/invitations/accept?token=${token}`);
      }, 1500);
    },
  });
};
