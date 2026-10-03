"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export function WorkspaceSlugSync() {
  const params = useParams();
  const routeSlug = params?.slug as string | undefined;

  const activeWorkspaceSlug = useWorkspaceStore((state) => state.activeWorkspaceSlug);
  const setActiveWorkspaceSlug = useWorkspaceStore(
    (state) => state.setActiveWorkspaceSlug,
  );

  useEffect(() => {
    if (!activeWorkspaceSlug && routeSlug) {
      setActiveWorkspaceSlug(routeSlug);
    }
  }, [activeWorkspaceSlug, routeSlug, setActiveWorkspaceSlug]);

  return null; // Component này chỉ chạy side-effect đồng bộ, không render UI
}
