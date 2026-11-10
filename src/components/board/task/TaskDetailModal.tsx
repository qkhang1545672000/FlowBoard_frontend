/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Tag, Check } from "lucide-react";
import { Task } from "@/types/column";
import { useAuthStore } from "@/store/useAuthStore";
import { useBoardStore } from "@/store/useBoardStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { TaskChecklistTab } from "./TaskChecklistTab";
import { useUpdateTask } from "@/hooks/useTask";
import { LoadingModal } from "@/components/ui/loading-modal";
import { TaskTooltipTitle } from "@/components/ui/TaskTooltipTitle";
import { TaskAttachmentsSidebar } from "./TaskAttachmentsSidebar";
import { TaskChatSection } from "./TaskChatSection";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onComplete?: (isCompleted: boolean) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export function TaskDetailModal({
  isOpen,
  onClose,
  task,
  onComplete,
}: TaskDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((state) => state.user);
  const boardId = useBoardStore((state) => state.activeBoardId) ?? "";
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId) ?? "";

  const { mutate: updateTask, isPending: isPendingUpdateTask } = useUpdateTask(boardId);
  const [activeTab, setActiveTab] = useState<"discussion" | "checklist">("discussion");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mockup tài liệu đính kèm bên cột phải
  const [files, setFiles] = useState<UploadedFile[]>([
    {
      id: "f1",
      name: "Flight_Options_V1.pdf",
      size: "2.1 MB",
      uploadedBy: "Alex Rivera",
      uploadedAt: "Oct 7",
    },
  ]);

  if (!isOpen || !mounted || !task) return null;

  const currentUserName = user?.name || "Me";
  const currentUserId = String(user?.id || (user as any)?._id || "");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles && uploadedFiles[0]) {
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: uploadedFiles[0].name,
        size: `${(uploadedFiles[0].size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedBy: currentUserName,
        uploadedAt: "Vừa xong",
      };
      setFiles([newFile, ...files]);
    }
  };

  if (isPendingUpdateTask) {
    return <LoadingModal isOpen={isPendingUpdateTask} />;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}>
      <div
        className="relative w-full max-w-4xl h-[85vh] max-h-[720px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Tag className="w-4 h-4" />
            </span>
            <div className="truncate">
              <h2 className="text-base font-semibold text-slate-100 truncate flex items-center gap-2">
                {task.title}
                <TaskTooltipTitle title={task.title} className="max-w-[100px]" />
              </h2>
              <p className="text-[11px] text-slate-400">Chi tiết công việc & Thảo luận</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                updateTask({
                  taskId: task.id,
                  isCompleted: !task.isCompleted,
                });
                if (onComplete) {
                  onComplete(!task.isCompleted);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm cursor-pointer shrink-0 ${
                task.isCompleted
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}>
              <Check className="w-4 h-4" />
              <span>{task.isCompleted ? "Đã hoàn thành" : "Hoàn thành"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors shrink-0 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body grid */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* CỘT TRÁI: Tabs (Thảo luận / Việc cần làm) */}
          <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/30 min-w-0">
            <div className="px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40 shrink-0">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setActiveTab("discussion")}
                  className={`text-xs font-medium pb-0.5 transition-colors relative cursor-pointer ${
                    activeTab === "discussion"
                      ? "text-indigo-400 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}>
                  Thảo luận
                  {activeTab === "discussion" && (
                    <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("checklist")}
                  className={`text-xs font-medium pb-0.5 transition-colors relative cursor-pointer ${
                    activeTab === "checklist"
                      ? "text-indigo-400 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}>
                  Việc cần làm
                  {activeTab === "checklist" && (
                    <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                  )}
                </button>
              </div>
            </div>

            {activeTab === "discussion" && (
              <TaskChatSection
                taskId={task.id}
                boardId={boardId}
                workspaceId={workspaceId}
                currentUserId={currentUserId}
                currentUserImage={user?.image}
                isOpen={isOpen}
              />
            )}

            {activeTab === "checklist" && <TaskChecklistTab task={task} />}
          </div>

          {/* CỘT PHẢI: Thông tin & Tài liệu */}
          <TaskAttachmentsSidebar
            task={task}
            files={files}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
