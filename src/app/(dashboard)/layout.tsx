"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/workspace/sidebar";

const mockWorkspaces = [
  { id: "1", name: "Innovate Solutions", slug: "innovate-solutions" },
  { id: "2", name: "Marketing Dynamics", slug: "marketing-dynamics" },
  { id: "3", name: "Design Crew", slug: "design-crew" },
];

export default function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
      {/* Sidebar thu gọn / mở rộng */}
      <Sidebar
        workspaces={mockWorkspaces}
        currentWorkspaceSlug={params.slug}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Nội dung chính sẽ tự mở rộng khi Sidebar đẩy vô */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
