import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { WorkspaceStore } from "@/types/workSpace";

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      // State ban đầu
      activeWorkspaceId: null,
      activeWorkspaceSlug: null,

      // Cập nhật cả ID và Slug cùng lúc (Khuyên dùng khi chọn Workspace mới)
      setActiveWorkspace: ({ id, slug }) =>
        set({
          activeWorkspaceId: id,
          activeWorkspaceSlug: slug,
        }),

      // Cập nhật lẻ ID
      setActiveWorkspaceId: (id) =>
        set({
          activeWorkspaceId: id,
        }),

      // Cập nhật lẻ Slug (dùng khi lấy slug từ URL params)
      setActiveWorkspaceSlug: (slug) =>
        set({
          activeWorkspaceSlug: slug,
        }),

      // Xóa trạng thái chọn (khi Đăng xuất)
      clearActiveWorkspace: () =>
        set({
          activeWorkspaceId: null,
          activeWorkspaceSlug: null,
        }),
    }),
    {
      name: "active-workspace-storage", // Tên key lưu trong LocalStorage
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
