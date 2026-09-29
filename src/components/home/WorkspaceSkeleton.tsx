import { WorkspaceCardSkeleton } from "./WorkspaceCardSkeleton";

export default function WorkspaceSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header trang (Tiêu đề loading) */}
      <div className="flex justify-between items-center animate-pulse">
        <div className="h-7 w-48 bg-slate-800 rounded-lg" />
        <div className="h-9 w-32 bg-slate-800 rounded-xl" />
      </div>

      {/* Grid danh sách Workspace Card Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <WorkspaceCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
