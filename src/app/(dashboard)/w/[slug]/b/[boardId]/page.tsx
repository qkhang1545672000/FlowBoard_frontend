"use client";

import React, { useState } from "react";
import { Header } from "@/components/workspace/header";
import { BoardBar } from "@/components/board/board-bar";
import { BoardVisibility, TaskPriority } from "@/types";
import {
  Plus,
  MoreHorizontal,
  Lock,
  Unlock,
  MessageSquare,
  Clock,
  Paperclip,
} from "lucide-react";

export default function BoardDetailPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const mockMembers = [
    {
      id: "u1",
      name: "Alex Rivera",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop",
    },
    {
      id: "u2",
      name: "Mia Wong",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop",
    },
    {
      id: "u3",
      name: "Ben Carter",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop",
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 h-screen text-slate-100 overflow-hidden">
      {/* 1. Header Chính */}
      <Header />

      {/* 2. Board Bar Thanh Công Cụ */}
      <BoardBar
        boardTitle="Product Launch Roadmap"
        visibility={BoardVisibility.WORKSPACE}
        members={mockMembers}
        onOpenChat={() => setIsChatOpen(!isChatOpen)}
        onOpenActivityLog={() => console.log("Activity Log opened")}
      />

      {/* 3. Khu Vực Cột Kanban (Board Canvas) */}
      {/* Thêm class 'group' vào container của cột */}
      <div className="group w-80 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col max-h-full backdrop-blur-md shrink-0">
        {/* 1. Header của Cột */}
        <div className="flex justify-between items-center mb-3 px-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-200">Backlog</h3>
            <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full font-medium">
              2
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Unlock className="w-3.5 h-3.5" title="Unlocked Column" />
            <button className="hover:text-slate-200 p-1">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Nút "Add Card" chuyển lên ĐẦU CỘT và cài đặt ẨN / HIỆN KHI HOVER */}
        <button className="mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 w-full py-2 bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-dashed border-slate-700">
          <Plus className="w-3.5 h-3.5" /> Add Card
        </button>

        {/* 3. Danh sách các Cards trong Cột */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {/* Card 1 */}
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 p-4 rounded-xl shadow-lg transition-all cursor-pointer space-y-3">
            <div className="flex gap-1.5 flex-wrap">
              <span className="h-2 w-8 bg-purple-500 rounded-full" />
              <span className="h-2 w-8 bg-indigo-500 rounded-full" />
            </div>
            <h4 className="text-sm font-semibold text-slate-100 hover:text-indigo-400 transition-colors">
              Design UI Mockups
            </h4>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/40">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-amber-400">
                  <Clock className="w-3.5 h-3.5" /> May 24
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> 3
                </span>
              </div>
              <img
                src={mockMembers[0].avatar}
                className="w-6 h-6 rounded-full border border-indigo-500/50"
              />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 p-4 rounded-xl shadow-lg transition-all cursor-pointer space-y-3">
            <span className="h-2 w-8 bg-emerald-500 rounded-full block" />
            <h4 className="text-sm font-semibold text-slate-100 hover:text-indigo-400 transition-colors">
              Setup API Endpoints
            </h4>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/40">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5" /> 2
                </span>
              </div>
              <img
                src={mockMembers[1].avatar}
                className="w-6 h-6 rounded-full border border-indigo-500/50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
