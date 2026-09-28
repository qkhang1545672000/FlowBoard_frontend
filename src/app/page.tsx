"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Folder,
  Plus,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  CheckCircle2,
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  LayoutGrid,
  Briefcase,
  Users,
  History,
  Settings,
  LogOut,
  ListTodo,
} from "lucide-react";
import { Participant } from "@/types";
import GroupChatAvatar from "@/components/ui/GroupChatAvatar";
// Dữ liệu giả lập test
const mockParticipants: Participant[] = [
  {
    _id: "1",
    displayName: "Alex Rivera",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    joinedAt: "2026-01-01",
  },
  {
    _id: "2",
    displayName: "Mia Wong",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100",
    joinedAt: "2026-01-01",
  },
  {
    _id: "3",
    displayName: "Ben Carter",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    joinedAt: "2026-01-01",
  },
  { _id: "4", displayName: "Sophia Chen", avatarUrl: null, joinedAt: "2026-01-01" },
  { _id: "5", displayName: "Daniel Kim", avatarUrl: null, joinedAt: "2026-01-01" },
  { _id: "6", displayName: "Emma Watson", avatarUrl: null, joinedAt: "2026-01-01" },
  { _id: "7", displayName: "Liam Neeson", avatarUrl: null, joinedAt: "2026-01-01" },
  { _id: "8", displayName: "Olivia Parker", avatarUrl: null, joinedAt: "2026-01-01" },
];
export default function DashboardHomePage() {
  const [activeTab, setActiveTab] = useState<"activity" | "overdue" | "system">(
    "overdue",
  );

  // Dữ liệu mẫu danh sách Workspaces
  const mockWorkspaces = [
    {
      id: "1",
      name: "Innovate Solutions",
      slug: "innovate-solutions",
      boardsCount: 6,
      updatedText: "2 hours ago",
      iconColor: "text-indigo-400",
      borderColor: "border-indigo-500/50",
    },
    {
      id: "2",
      name: "Marketing Dynamics",
      slug: "marketing-dynamics",
      boardsCount: 6,
      updatedText: "2 hours ago",
      iconColor: "text-amber-400",
      borderColor: "border-slate-800",
    },
    {
      id: "3",
      name: "Product Team",
      slug: "product-team",
      boardsCount: 6,
      updatedText: "2 hours ago",
      iconColor: "text-sky-400",
      borderColor: "border-sky-500/50",
    },
    {
      id: "4",
      name: "Design Crew",
      slug: "design-crew",
      boardsCount: 4,
      updatedText: "2 hours ago",
      iconColor: "text-purple-400",
      borderColor: "border-slate-800",
    },
    {
      id: "5",
      name: "Design Destion",
      slug: "design-destion",
      boardsCount: 4,
      updatedText: "2 hours ago",
      iconColor: "text-pink-400",
      borderColor: "border-slate-800",
    },
    {
      id: "6",
      name: "Design Team",
      slug: "design-team",
      boardsCount: 4,
      updatedText: "2 hours ago",
      iconColor: "text-emerald-400",
      borderColor: "border-slate-800",
    },
    {
      id: "7",
      name: "Colonet Team",
      slug: "colonet-team",
      boardsCount: 6,
      updatedText: "2 hours ago",
      iconColor: "text-indigo-400",
      borderColor: "border-slate-800",
    },
  ];

  // Dữ liệu mẫu các Task sắp quá hạn
  const overdueTasks = [
    {
      id: "t1",
      title: "Design UI Mockups",
      board: "Original Board",
      dueDays: "Due in 1 day",
      assignee: "Alex",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop",
      urgentLevel: "high",
    },
    {
      id: "t2",
      title: "Finalize QA Testing",
      board: "Original Board",
      dueDays: "Due in 3 days",
      assignee: "Mia",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop",
      urgentLevel: "medium",
    },
    {
      id: "t3",
      title: "Develop UI Marketing Campaign Planning",
      board: "Original Board",
      dueDays: "Due in 1 day",
      assignee: "Ben",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop",
      urgentLevel: "high",
    },
    {
      id: "t4",
      title: "Develop Q1A Testing - Marketing and Planning",
      board: "Original Board",
      dueDays: "Due in 3 days",
      assignee: "Ben",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop",
      urgentLevel: "medium",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* KHU VỰC NỘI DUNG CHÍNH (Glassmorphism Main Dashboard) */}
      <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
        {/* 1. Header Tìm kiếm & Profile */}
        <header className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-indigo-500/20">
              TF
            </div>
            <span className="text-xl font-bold tracking-tight text-white">TaskFlow</span>
          </div>

          {/* Thanh Search Bar */}
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search to search..."
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-10 pr-16 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded border border-slate-600">
              Ctrl+K
            </kbd>
          </div>

          {/* Quick Action & User */}
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800">
              <MessageSquare className="w-4 h-4" />
            </button>
            <div className="relative">
              <button className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800">
                <Bell className="w-4 h-4" />
              </button>
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                3
              </span>
            </div>

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop"
                alt="Alex Rivera"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  Alex Rivera
                </span>
                <span className="text-[10px] text-slate-400">Logged in</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </div>
          </div>
        </header>

        {/* 2. Phần MY WORKSPACES */}
        <section className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              MY WORKSPACES
            </h2>
            <button className="text-slate-400 hover:text-white p-1">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Grid chứa danh sách Workspace Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockWorkspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/w/${ws.slug}`}
                className={`group bg-slate-900/80 hover:bg-slate-800/90 border ${ws.borderColor} hover:border-indigo-500/60 p-4 rounded-2xl transition-all shadow-lg flex flex-col justify-between space-y-4 backdrop-blur-md`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/50">
                      <Folder className={`w-5 h-5 ${ws.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                        {ws.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {ws.boardsCount} boards
                      </p>
                    </div>
                  </div>
                  <button className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-3">
                  <div className="flex items-center -space-x-1.5">
                    <GroupChatAvatar
                      participants={mockParticipants}
                      type="sidebar"
                      maxVisible={3}
                    />
                  </div>
                  <span>{ws.updatedText}</span>
                </div>
              </Link>
            ))}

            {/* Thẻ Nút Add New Workspace */}
            <button className="bg-slate-900/30 hover:bg-slate-800/50 border border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 flex items-center justify-center transition-all group min-h-[110px]">
              <div className="p-3 bg-slate-800/50 rounded-xl group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
              </div>
            </button>
          </div>
        </section>

        {/* 3. Phần MY NOTIFICATIONS (Tasks Sắp Quá Hạn) */}
        <section className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              MY NOTIFICATIONS
            </h2>
            <button className="text-slate-400 hover:text-white p-1">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 border-b border-slate-800 pb-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("activity")}
              className={`pb-2 border-b-2 transition-all ${
                activeTab === "activity"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}>
              New Activity (3)
            </button>

            <button
              onClick={() => setActiveTab("overdue")}
              className={`pb-2 border-b-2 flex items-center gap-2 transition-all ${
                activeTab === "overdue"
                  ? "border-indigo-500 text-slate-100"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}>
              <span>Tasks Approaching Overdue (5)</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </button>

            <button
              onClick={() => setActiveTab("system")}
              className={`pb-2 border-b-2 transition-all ${
                activeTab === "system"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}>
              System (1)
            </button>
          </div>

          {/* List Nhiệm vụ sắp quá hạn */}
          <div className="space-y-3 pt-2">
            {overdueTasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-md backdrop-blur-md">
                {/* Thông tin Task */}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-800/80 rounded-xl text-amber-400 border border-slate-700/50 shrink-0">
                    <ListTodo className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{task.title}</h4>
                    <p className="text-[11px] text-slate-400">{task.board}</p>
                  </div>
                </div>

                {/* Hạn chót & Người đảm nhận */}
                <div className="flex items-center gap-6 text-xs w-full md:w-auto justify-between md:justify-end">
                  <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{task.dueDays}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <img
                      src={task.avatar}
                      alt={task.assignee}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-slate-300 text-xs font-medium">
                      {task.assignee}
                    </span>
                  </div>

                  {/* Nút thao tác nhanh */}
                  <div className="flex items-center gap-2">
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium px-3 py-1.5 rounded-xl border border-slate-700 transition-all">
                      View Card
                    </button>
                    <button className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-[11px] font-semibold px-3 py-1.5 rounded-xl border border-indigo-500/30 transition-all">
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* RIGHT SIDEBAR (Cột menu bên phải giống ảnh) */}
    </div>
  );
}
