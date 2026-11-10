/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Clock, User as UserIcon, FileText, UploadCloud, Download } from "lucide-react";
import { Task } from "@/types/column";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface TaskAttachmentsSidebarProps {
  task: Task;
  files: UploadedFile[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TaskAttachmentsSidebar({
  task,
  files,
  onFileUpload,
}: TaskAttachmentsSidebarProps) {
  const leader = task.members.find((i) => i.role === "TASK_LEADER");

  return (
    <div className="w-full md:w-80 p-4 flex flex-col gap-4 overflow-y-auto bg-slate-900/60 shrink-0">
      {/* Thông tin thẻ */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Thông tin thẻ
        </h3>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 space-y-2.5 text-xs">
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
              <UserIcon className="w-3.5 h-3.5" /> Nhóm trưởng:
            </span>
            <span className="font-medium text-slate-200 truncate">
              {leader ? leader.user.name : "Chưa giao"}
            </span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Hạn chót:
            </span>
            <span className="font-medium text-slate-200">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString("vi-VN") : "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-400 shrink-0">Độ ưu tiên:</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {task.priority || "NORMAL"}
            </span>
          </div>
        </div>
      </div>

      {/* Tài liệu đính kèm */}
      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Tài liệu ({files.length})
          </h3>
          <label className="cursor-pointer text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Tải file</span>
            <input type="file" className="hidden" onChange={onFileUpload} />
          </label>
        </div>

        <div className="space-y-2 overflow-y-auto pr-1">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 bg-slate-800/60 border border-slate-700/50 rounded-xl hover:bg-slate-800 transition-all">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-slate-200 truncate">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {file.size} • {file.uploadedBy}
                  </p>
                </div>
              </div>

              <button className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-lg transition-colors shrink-0 cursor-pointer">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
