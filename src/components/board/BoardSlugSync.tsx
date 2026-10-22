"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useBoardStore } from "@/store/useBoardStore";

export function BoardSlugSync() {
  const pathname = usePathname();
  const { activeBoardId, setActiveBoardId, setActiveBoardSlug, clearActiveBoard } =
    useBoardStore();

  useEffect(() => {
    // 1. Nếu không nằm trong trang board (thoát khỏi /b/)
    if (!pathname || !pathname.includes("/b/")) {
      // Lưu lại ID hiện tại trước khi clear để phòng hờ quay lại nhanh
      if (activeBoardId) {
        localStorage.setItem("last-active-board-id", activeBoardId);
      }

      clearActiveBoard();
      localStorage.removeItem("active-board-storage");
      return;
    }

    // 2. Nếu đang ở trang board, trích xuất slug từ URL: /b/[board-slug]
    const parts = pathname.split("/");
    const bIndex = parts.indexOf("b");
    const boardSlugFromUrl = bIndex !== -1 ? parts[bIndex + 1] : null;

    if (boardSlugFromUrl) {
      setActiveBoardSlug(boardSlugFromUrl);

      // 3. TÌM ID TRONG LOCALSTORAGE NGAY LẬP TỨC (Không cần gọi API)
      // Bạn có thể lưu một bảng ánh xạ slug -> id dưới dạng JSON trong localStorage, ví dụ: "board-slug-to-id-map"
      const mappingStr = localStorage.getItem("board-slug-to-id-map");
      if (mappingStr) {
        try {
          const slugToIdMap = JSON.parse(mappingStr);
          const cachedId = slugToIdMap[boardSlugFromUrl];

          if (cachedId) {
            setActiveBoardId(cachedId);
            localStorage.setItem("last-active-board-id", cachedId);
            return; // Đã tìm thấy ID, kết thúc luôn, không cần làm gì thêm!
          }
        } catch (e) {
          console.error("Lỗi đọc map board từ localStorage", e);
        }
      }

      // 4. Phòng hờ trường hợp không tìm thấy trong map, lấy tạm last-active-board-id
      const lastId = localStorage.getItem("last-active-board-id");
      if (lastId && !activeBoardId) {
        setActiveBoardId(lastId);
      }
    }
  }, [pathname, activeBoardId, setActiveBoardId, setActiveBoardSlug, clearActiveBoard]);

  return null;
}
