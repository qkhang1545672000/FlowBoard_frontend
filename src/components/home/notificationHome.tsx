"use client";
import { Clock, ListTodo, MoreHorizontal } from "lucide-react";
import { useState } from "react";
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
const NotificationIndex = () => {
  const [activeTab, setActiveTab] = useState<"activity" | "overdue" | "system">(
    "overdue",
  );
  return (
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
  );
};
export default NotificationIndex;
