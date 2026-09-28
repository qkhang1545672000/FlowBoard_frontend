// src/app/test/page.tsx
"use client";

import { useEffect } from "react";
import { workSpaceService } from "@/services/workspace.service";

export default function TestPage() {
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await workSpaceService.getWorkSpace();
        console.log("Dữ liệu user:", userData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu user:", error);
      }
    };

    fetchUserData();
  }, []);

  return <div>Test Page</div>;
}
