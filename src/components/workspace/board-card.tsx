"use client";

import React from "react";
import Link from "next/link";
import { Board } from "@/types";
import { MoreHorizontal, Users, CheckSquare } from "lucide-react";

interface BoardCardProps {
  board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
  return (
    <Link href={`/b/${board.id}`}>
      <div className="group bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 transition-all duration-200 hover:shadow-xl hover:border-slate-600 cursor-pointer flex flex-col justify-between h-56 backdrop-blur-sm">
        {/* Header: Title & Actions */}
        <div>
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
              {board.title}
            </h3>
            <button
              onClick={(e) => e.preventDefault()}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-700/50">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Kanban Visual Mini-Preview Mockup */}
          <div className="grid grid-cols-4 gap-1.5 my-3 opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="h-10 bg-slate-700/50 rounded-lg border border-slate-600/30 p-1">
              <div className="h-1.5 bg-indigo-500/80 rounded w-full mb-1" />
              <div className="h-1.5 bg-slate-600 rounded w-3/4" />
            </div>
            <div className="h-10 bg-slate-700/50 rounded-lg border border-slate-600/30 p-1">
              <div className="h-1.5 bg-emerald-500/80 rounded w-full mb-1" />
            </div>
            <div className="h-10 bg-slate-700/50 rounded-lg border border-slate-600/30 p-1">
              <div className="h-1.5 bg-amber-500/80 rounded w-full mb-1" />
              <div className="h-1.5 bg-slate-600 rounded w-1/2" />
            </div>
            <div className="h-10 bg-slate-700/50 rounded-lg border border-slate-600/30 p-1">
              <div className="h-1.5 bg-purple-500/80 rounded w-full mb-1" />
            </div>
          </div>
        </div>

        {/* Footer: Metadata */}
        <div className="border-t border-slate-700/40 pt-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
              {board.activeTasksCount || 0} Tasks
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              {board.membersCount || 1}
            </span>
          </div>
          <span>Updated {board.updatedAt}</span>
        </div>
      </div>
    </Link>
  );
}
