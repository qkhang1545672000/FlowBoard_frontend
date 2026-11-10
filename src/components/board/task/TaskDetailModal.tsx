/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  X,
  Paperclip,
  Send,
  Image as ImageIcon,
  FileText,
  UploadCloud,
  Download,
  Clock,
  User as UserIcon,
  Tag,
  Loader2,
  Check,
} from "lucide-react";
import { Task } from "@/types/column";
import { useAuthStore } from "@/store/useAuthStore";
import { useBoardStore } from "@/store/useBoardStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useGetMessages, useSendMessage } from "@/hooks/useChat";
import { useChatSocket } from "@/hooks/useChatSocket";
import { ChatScope } from "@/services/chat.service";
import UserAvatar from "../../ui/UserAvatar";
import { TaskChecklistTab } from "./TaskChecklistTab";
import { useUpdateTask } from "@/hooks/useTask";
import { LoadingModal } from "@/components/ui/loading-modal";
import { TaskTooltipTitle } from "@/components/ui/TaskTooltipTitle";

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
  const leader = task.members.find((i) => i.role === "TASK_LEADER");

  const { mutate: updateTask, isPending: isPendingUpdateTask } = useUpdateTask(boardId);

  const [inputText, setInputText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<"discussion" | "checklist">("discussion");

  useEffect(() => {
    setMounted(true);
  }, []);

  const { emitSendMessage } = useChatSocket(ChatScope.TASK, task?.id || "");

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    fetchNextPage,
    hasNextPage,
  } = useGetMessages(ChatScope.TASK, task?.id || "");
  const sendMessageMutation = useSendMessage();

  // Khử trùng lặp ID tin nhắn khi gộp các trang phân trang (Tránh lỗi React key và mất mát dữ liệu cũ)
  const rawMessages = messagesData?.pages
    ? [...messagesData.pages]
        .reverse()
        .flatMap((page) => page.items || [])
        .reverse()
    : [];
  const messages = Array.from(new Map(rawMessages.map((m: any) => [m.id, m])).values());

  const currentUserId = String(user?.id || (user as any)?._id || "");
  const scrollStorageKey = `chat-scroll-task-${task?.id}`;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    if (isOpen && activeTab === "discussion" && messagesEndRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [isOpen, activeTab, task?.id]);

  const handleScrollSave = () => {
    const container = containerRef.current;
    if (!container || !task?.id) return;

    sessionStorage.setItem(
      scrollStorageKey,
      JSON.stringify({
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
      }),
    );
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const item = sessionStorage.getItem(scrollStorageKey);
    if (item) {
      const { scrollTop } = JSON.parse(item);
      requestAnimationFrame(() => {
        container.scrollTop = scrollTop;
      });
    }
  }, [messages.length, scrollStorageKey]);

  const [files, setFiles] = useState<UploadedFile[]>([
    {
      id: "f1",
      name: "Flight_Options_V1.pdf",
      size: "2.1 MB",
      uploadedBy: "Alex Rivera",
      uploadedAt: "Oct 7",
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!isOpen || !mounted || !task) return null;

  const currentUserName = user?.name || "Me";

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && selectedFiles.length === 0) || !user) return;

    try {
      const payload = {
        scope: ChatScope.TASK,
        taskId: task.id,
        boardId: boardId || undefined,
        workspaceId: workspaceId || undefined,
        content: inputText.trim(),
        files: selectedFiles,
      };

      await sendMessageMutation.mutateAsync(payload);

      setInputText("");
      setSelectedFiles([]);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Lỗi gửi tin nhắn kèm file:", error);
    }
  };

  const handleChatFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileUploadSidebar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles && uploadedFiles[0]) {
      const sizeMB = (uploadedFiles[0].size / (1024 * 1024)).toFixed(1);
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: uploadedFiles[0].name,
        size: `${sizeMB} MB`,
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
              <h2 className="text-base font-semibold text-slate-100 truncate">
                <TaskTooltipTitle title={task.title} className="max-w-[200px]" />
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body grid */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* CỘT TRÁI */}
          <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/30 min-w-0">
            <div className="px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40 shrink-0">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setActiveTab("discussion")}
                  className={`text-xs font-medium pb-0.5 transition-colors relative ${
                    activeTab === "discussion"
                      ? "text-indigo-400 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}>
                  Thảo luận ({messages.length} tin nhắn)
                  {activeTab === "discussion" && (
                    <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("checklist")}
                  className={`text-xs font-medium pb-0.5 transition-colors relative ${
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
              <>
                {isLoadingMessages ? (
                  <div className="flex h-full items-center justify-center text-slate-400 gap-2 flex-1">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-xs">Đang tải tin nhắn...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-slate-500 text-xs flex-1">
                    Chưa có tin nhắn nào trong công việc này.
                  </div>
                ) : (
                  <div
                    id="taskScrollableDiv"
                    ref={containerRef}
                    onScroll={handleScrollSave}
                    className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col-reverse relative beautiful-scrollbar">
                    <div ref={messagesEndRef} />

                    <InfiniteScroll
                      dataLength={messages.length}
                      next={fetchNextPage}
                      hasMore={hasNextPage ?? false}
                      scrollableTarget="taskScrollableDiv"
                      loader={
                        <p className="text-center text-xs py-2 text-slate-400">
                          Đang tải thêm tin nhắn cũ...
                        </p>
                      }
                      inverse={true}
                      style={{
                        display: "flex",
                        flexDirection: "column-reverse",
                        overflow: "visible",
                      }}>
                      {messages.map((msg: any, index: number) => {
                        const senderId = String(msg.sender?.id || msg.senderId || "");
                        const isMe = Boolean(currentUserId && senderId === currentUserId);
                        const senderName = msg.sender?.name || "Người dùng";

                        return (
                          <div
                            key={msg.id || index}
                            className={`flex items-end gap-2 mb-3 ${
                              isMe ? "flex-row-reverse" : "flex-row"
                            }`}>
                            {!isMe && (
                              <UserAvatar
                                name={senderName}
                                avatarUrl={msg.sender?.image}
                                type="chat"
                                fallbackClassName="bg-indigo-600 text-xs shrink-0"
                              />
                            )}

                            <div
                              className={`flex flex-col max-w-[80%] ${
                                isMe ? "items-end" : "items-start"
                              }`}>
                              {!isMe && (
                                <span className="text-[10px] text-slate-400 mb-1 ml-1">
                                  {senderName}
                                </span>
                              )}

                              <div
                                className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed break-words max-w-full ${
                                  isMe
                                    ? "bg-blue-600 text-white rounded-br-xs shadow-md"
                                    : "bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/60"
                                }`}>
                                {msg.content}

                                {msg.attachments && msg.attachments.length > 0 && (
                                  <div className="mt-2 space-y-2">
                                    {msg.attachments.map((att: any, idx: number) => {
                                      const attUrl =
                                        typeof att === "string" ? att : att?.url || "";
                                      const attName =
                                        typeof att === "string"
                                          ? "Tập tin đính kèm"
                                          : att?.name || "Tập tin đính kèm";
                                      const attType =
                                        typeof att === "string" ? "" : att?.type || "";

                                      const isImage =
                                        /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(attUrl) ||
                                        attType === "image" ||
                                        attUrl.includes("/image/upload/");

                                      return isImage ? (
                                        <a
                                          key={idx}
                                          href={attUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block overflow-hidden rounded-lg border border-slate-700/60 max-w-[240px] max-h-[200px] bg-slate-950/40 hover:opacity-95 transition-opacity">
                                          <img
                                            src={attUrl}
                                            alt={attName}
                                            className="w-full h-auto object-cover max-h-[180px]"
                                          />
                                        </a>
                                      ) : (
                                        <a
                                          key={idx}
                                          href={attUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`flex items-center gap-2 p-2.5 rounded-lg text-xs hover:opacity-90 transition-opacity ${
                                            isMe
                                              ? "bg-blue-700/60 text-white"
                                              : "bg-slate-900/80 text-slate-200 border border-slate-700/50"
                                          }`}>
                                          <FileText className="w-4 h-4 shrink-0 text-amber-400" />
                                          <div className="flex flex-col truncate">
                                            <span className="truncate font-medium">
                                              {attName}
                                            </span>
                                            <span className="text-[10px] text-slate-400 underline">
                                              Nhấn để tải về / Xem
                                            </span>
                                          </div>
                                        </a>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              <span className="text-[9px] text-slate-500 mt-1 px-1">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </InfiniteScroll>
                  </div>
                )}

                {selectedFiles.length > 0 && (
                  <div className="px-3 pt-2 bg-slate-900/90 border-t border-slate-800 flex flex-wrap gap-2">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-xs text-slate-200">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="max-w-[120px] truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="text-slate-400 hover:text-red-400 ml-1">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-800 bg-slate-900/80 shrink-0">
                  <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/70 rounded-full px-3 py-1 focus-within:border-blue-500 transition-colors">
                    <label className="cursor-pointer p-1.5 text-slate-400 hover:text-blue-400 transition-colors">
                      <Paperclip className="w-4 h-4" />
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleChatFileSelect}
                      />
                    </label>

                    <label className="cursor-pointer p-1.5 text-slate-400 hover:text-blue-400 transition-colors">
                      <ImageIcon className="w-4 h-4" />
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleChatFileSelect}
                      />
                    </label>

                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Viết tin nhắn hoặc đính kèm file..."
                      className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none px-2 min-w-0"
                    />

                    <button
                      type="submit"
                      disabled={
                        (!inputText.trim() && selectedFiles.length === 0) ||
                        sendMessageMutation.isPending
                      }
                      className="p-1.5 sm:p-2 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-all shrink-0">
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab === "checklist" && <TaskChecklistTab task={task} />}
          </div>

          {/* CỘT PHẢI */}
          <div className="w-full md:w-80 p-4 flex flex-col gap-4 overflow-y-auto bg-slate-900/60 shrink-0">
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
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString("vi-VN")
                      : "N/A"}
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

            <div className="flex-1 flex flex-col gap-2 min-h-0">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Tài liệu ({files.length})
                </h3>
                <label className="cursor-pointer text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Tải file</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUploadSidebar}
                  />
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

                    <button className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-lg transition-colors shrink-0">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
