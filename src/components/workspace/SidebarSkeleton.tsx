import React from "react";

interface SidebarSkeletonProps {
  isCollapsed?: boolean;
}

export function SidebarSkeleton({ isCollapsed = false }: SidebarSkeletonProps) {
  const WIDTHS = ["60%", "75%", "50%", "80%", "65%"];
  return (
    <aside
      className={`relative bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen text-slate-300 transition-all duration-300 ease-in-out z-40 animate-pulse ${
        isCollapsed ? "w-16" : "w-64"
      }`}>
      {/* Skeleton Nút Toggle Collapse */}
      <div className="absolute -right-3 top-6 w-6 h-6 bg-slate-800 rounded-full border border-slate-700 z-50" />

      <div className="p-3 space-y-6 overflow-hidden">
        {/* Skeleton Logo / Brand */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-lg bg-slate-800 shrink-0" />
          {!isCollapsed && <div className="h-4 w-32 bg-slate-800 rounded" />}
        </div>

        {/* Skeleton User Info Quick View */}
        <div className="bg-slate-800/40 rounded-xl p-2.5 flex items-center gap-3 border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-700/80 shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-3 w-20 bg-slate-700/80 rounded" />
              <div className="h-2.5 w-14 bg-slate-800 rounded" />
            </div>
          )}
        </div>

        {/* Skeleton Workspaces List */}
        <div>
          {!isCollapsed && <div className="h-3 w-20 bg-slate-800/80 rounded px-2 mb-3" />}
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl bg-slate-800/30">
                <div className="w-4 h-4 bg-slate-700/80 rounded shrink-0" />
                {!isCollapsed && (
                  <div
                    className="h-3 bg-slate-700/60 rounded"
                    // Lấy độ rộng theo index thay vì Math.random()
                    style={{ width: WIDTHS[idx % WIDTHS.length] }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skeleton Footer Button: Create Workspace */}
      <div className="p-3 border-t border-slate-800">
        <div
          className={`w-full h-10 bg-slate-800 rounded-xl ${
            isCollapsed ? "px-2" : "px-4"
          }`}
        />
      </div>
    </aside>
  );
}
