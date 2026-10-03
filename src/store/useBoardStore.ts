import { BoardStore } from "@/types/board";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand/react";

export const useBoardStore = create<BoardStore>()(
  persist(
    (set) => ({
      // State ban đầu
      activeBoardId: null,
      activeBoardSlug: null,

      // Cập nhật cả ID và Slug cùng lúc
      setActiveBoard: ({ id, slug }) =>
        set({
          activeBoardId: id,
          activeBoardSlug: slug,
        }),

      // Cập nhật lẻ ID (Sửa kiểu dữ liệu id: string | null)
      setActiveBoardId: (id: string | null) =>
        set({
          activeBoardId: id,
        }),

      // Cập nhật lẻ Slug (Đã thêm hàm bị thiếu)
      setActiveBoardSlug: (slug: string | null) =>
        set({
          activeBoardSlug: slug,
        }),

      // Xóa trạng thái chọn Board (Đã thêm hàm bị thiếu)
      clearActiveBoard: () =>
        set({
          activeBoardId: null,
          activeBoardSlug: null,
        }),
    }),
    {
      name: "active-board-storage", // Đã đổi tên key cho chuẩn với Board
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
