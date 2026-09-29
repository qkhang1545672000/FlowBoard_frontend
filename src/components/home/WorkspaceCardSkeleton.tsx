import React from "react";

export const WorkspaceCardSkeleton = () => {
  return (
    <div className="bg-slate-900/80 border border-slate-800/60 p-4 rounded-2xl shadow-lg flex flex-col justify-between space-y-4 backdrop-blur-md animate-pulse">
      {/* Header section */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Icon Folder Placeholder */}
          <div className="w-9 h-9 bg-slate-800/80 rounded-xl border border-slate-700/50 flex items-center justify-center">
            <div className="w-5 h-5 bg-slate-700/60 rounded" />
          </div>

          {/* Title & Subtitle Placeholder */}
          <div className="space-y-1.5">
            <div className="h-4 w-28 bg-slate-700/80 rounded" />
            <div className="h-3 w-16 bg-slate-800/80 rounded" />
          </div>
        </div>

        {/* Action Button Placeholder */}
        <div className="w-4 h-4 bg-slate-800/60 rounded" />
      </div>

      {/* Footer section */}
      <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
        {/* Avatars Placeholder */}
        <div className="flex items-center -space-x-1.5">
          <div className="w-6 h-6 rounded-full bg-slate-700/80 border-2 border-slate-900" />
          <div className="w-6 h-6 rounded-full bg-slate-700/60 border-2 border-slate-900" />
          <div className="w-6 h-6 rounded-full bg-slate-700/40 border-2 border-slate-900" />
        </div>

        {/* Updated Text Placeholder */}
        <div className="h-3 w-14 bg-slate-800/80 rounded" />
      </div>
    </div>
  );
};
