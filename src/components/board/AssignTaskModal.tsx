"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Search, X, Mail } from "lucide-react";
import { Task } from "@/types/column";
import CardMember from "./cardMember";
import { useBoardStore } from "@/store/useBoardStore";
import { useBoardDetail } from "@/hooks/useBoard";
import { useWorkspaceDetail } from "@/hooks/useWorkSpace";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useUpdateAssignTask } from "@/hooks/useTask";

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onAssign?: (userId: string) => void;
  onInviteEmail?: (email: string, role: string) => void;
}

export function AssignTaskModal({
  isOpen,
  onClose,
  task,
  onAssign,
  onInviteEmail,
}: AssignTaskModalProps) {
  const [activeMainTab, setActiveMainTab] = useState<"existing" | "invite">("existing");
  const [activeSubTab, setActiveSubTab] = useState<"project" | "workspace">("project");
  const [searchQuery, setSearchQuery] = useState("");
  const boardId = useBoardStore((state) => state.activeBoardId) ?? "";
  const wordspaceId = useWorkspaceStore((state) => state.activeWorkspaceId) ?? "";
  const { data: BoardDetail, isPending: isPendingBoardDetail } = useBoardDetail(boardId);
  const { data: WorkspaceDetail, isPending: isPendingWorkspaceDetail } =
    useWorkspaceDetail(wordspaceId);
  const { mutate: updateAssignTask } = useUpdateAssignTask(boardId);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    task.assignee?.id || null,
  );

  // State cho phần Mời người lạ qua email
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  if (!isOpen || typeof window === "undefined") return null;
  const memberWorkspace = WorkspaceDetail?.members.filter((w) => w.role !== "OWNER");
  const handleAssign = async () => {
    if (!selectedUserId) return;
    console.log(" task.id", task.id);
    await updateAssignTask({ taskId: task.id, userId: selectedUserId });
  };
  return createPortal(
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#1b2230] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-base font-semibold text-slate-100">
            Assign Task: {task.title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Tabs ở trên */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveMainTab("existing")}
            className={`pb-3 relative transition-colors ${
              activeMainTab === "existing"
                ? "text-white"
                : "text-slate-400 hover:text-slate-300"
            }`}>
            THÀNH VIÊN ĐÃ CÓ
            {activeMainTab === "existing" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveMainTab("invite")}
            className={`pb-3 relative transition-colors ${
              activeMainTab === "invite"
                ? "text-white"
                : "text-slate-400 hover:text-slate-300"
            }`}>
            MỜI NGƯỜI LẠ QUA EMAIL
            {activeMainTab === "invite" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            )}
          </button>
        </div>

        {/* Nội dung theo Tab chính */}
        <div className="p-6 space-y-4 flex-1">
          {activeMainTab === "existing" ? (
            <>
              {/* Thanh tìm kiếm */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm hoặc nhập email người được gán..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Sub-tabs: Thành viên Project và Thành viên Workspace */}
              <div className="flex gap-6 text-xs font-medium border-b border-slate-800/80 pb-2 pt-1 text-slate-400">
                <button
                  onClick={() => setActiveSubTab("project")}
                  className={`transition-colors relative pb-1 ${
                    activeSubTab === "project"
                      ? "text-white font-semibold"
                      : "hover:text-slate-300"
                  }`}>
                  Thành viên Project
                  {activeSubTab === "project" && (
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-white" />
                  )}
                </button>
                <button
                  onClick={() => setActiveSubTab("workspace")}
                  className={`transition-colors relative pb-1 ${
                    activeSubTab === "workspace"
                      ? "text-white font-semibold"
                      : "hover:text-slate-300"
                  }`}>
                  Thành viên Workspace
                  {activeSubTab === "workspace" && (
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-white" />
                  )}
                </button>
              </div>

              {/* Danh sách hiển thị theo sub-tab */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {activeSubTab === "project" ? (
                  <div>
                    <div className="text-xs font-medium text-slate-400 mb-2">
                      Danh sách Thành viên Project ({BoardDetail?.members.length})
                    </div>
                    <div className="space-y-1">
                      {BoardDetail?.members.map((member) => (
                        <CardMember
                          key={member.id}
                          member={member}
                          selectedUserId={selectedUserId}
                          setSelectedUserId={setSelectedUserId}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs font-medium text-slate-400 mb-2">
                      Danh sách Thành viên Workspace ({memberWorkspace?.length})
                    </div>
                    <div className="space-y-1">
                      {memberWorkspace?.map((member) => (
                        <CardMember
                          key={member.id}
                          member={member}
                          selectedUserId={selectedUserId}
                          setSelectedUserId={setSelectedUserId}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Tab Mời người lạ qua email */
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Nhập địa chỉ email người lạ...
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-xs text-slate-400 italic pt-1">
                  * Sẽ gửi email mời vào Project
                </p>
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-xs font-medium text-slate-300">Vai trò</label>
                <button
                  type="button"
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 flex items-center justify-between focus:outline-none">
                  <span>{inviteRole}</span>
                  <span className="text-slate-400 text-xs">▼</span>
                </button>

                {isRoleDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden text-sm">
                    {["Member", "Editor", "Viewer"].map((role) => (
                      <div
                        key={role}
                        onClick={() => {
                          setInviteRole(role);
                          setIsRoleDropdownOpen(false);
                        }}
                        className="px-4 py-2.5 hover:bg-slate-800 cursor-pointer text-slate-200">
                        {role}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onInviteEmail) onInviteEmail(inviteEmail, inviteRole);
                  onClose();
                }}
                className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-sm rounded-xl transition-colors">
                Mời qua Email
              </button>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/40">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors">
            Hủy
          </button>
          <button
            onClick={() => {
              handleAssign();
              onClose();
            }}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-cyan-500/20">
            Áp dụng
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
