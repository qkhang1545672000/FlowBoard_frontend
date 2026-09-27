"use client";

import React, { useState } from "react";
import {
  Lock,
  Globe,
  Users,
  Filter,
  MessageSquare,
  History,
  Plus,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { BoardVisibility } from "@/types";

interface BoardBarProps {
  boardTitle: string;
  visibility: BoardVisibility;
  members: { id: string; name: string; avatar: string }[];
  onOpenChat: () => void;
  onOpenActivityLog: () => void;
}

export function BoardBar({
  boardTitle,
  visibility,
  members,
  onOpenChat,
  onOpenActivityLog,
}: BoardBarProps) {
  return (
    <div className="h-14 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-16 z-30">
      {/* Trái: Board Info & Scope */}
      <div className="flex items-center gap-4">
        {/* Title */}
        <h1 className="text-lg font-bold text-slate-100 hover:bg-slate-800/60 px-3 py-1 rounded-lg cursor-pointer transition-colors">
          {boardTitle}
        </h1>
        <div className="h-4 w-[1px] bg-slate-800" />

        {/* Visibility Badge */}
        <button className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/50 transition-colors">
          {visibility === BoardVisibility.PRIVATE && (
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          )}
          {visibility === BoardVisibility.WORKSPACE && (
            <Users className="w-3.5 h-3.5 text-indigo-400" />
          )}
          {visibility === BoardVisibility.PUBLIC && (
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span className="capitalize">{visibility.toLowerCase()}</span>
        </button>
        <div className="h-4 w-[1px] bg-slate-800" />
        {/* Filter Tasks */}
        <button className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/50 transition-colors">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Filter</span>
        </button>
      </div>

      {/* Phải: Members, Real-time Chat & Actions */}
      <div className="flex items-center gap-3">
        {/* Members Avatars List */}
        <div className="flex items-center -space-x-2 overflow-hidden">
          {members.slice(0, 4).map((m) => (
            <img
              key={m.id}
              src={m.avatar}
              alt={m.name}
              title={m.name}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 object-cover"
            />
          ))}
          {members.length > 4 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-slate-300 ring-2 ring-slate-900">
              +{members.length - 4}
            </div>
          )}
        </div>

        {/* Share / Add Member */}
        <button className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all shadow-md shadow-indigo-600/20">
          <Plus className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-800" />

        {/* Real-time Board Chat Trigger */}
        <button
          onClick={onOpenChat}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors relative"
          title="Board Chat">
          <MessageSquare className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        {/* Activity Log Trigger */}
        <button
          onClick={onOpenActivityLog}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          title="Activity Log">
          <History className="w-4 h-4" />
        </button>

        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
