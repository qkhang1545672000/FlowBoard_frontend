"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
} from "lucide-react";
import { Task } from "@/types/column";
import { useAuthStore } from "@/store/useAuthStore";
import { useBoardStore } from "@/store/useBoardStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useGetMessages, useSendMessage } from "@/hooks/useChat";
import { useChatSocket } from "@/hooks/useChatSocket";
import { ChatScope } from "@/services/chat.service";
import UserAvatar from "../ui/UserAvatar";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export function TaskDetailModal({ isOpen, onClose, task }: TaskDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((state) => state.user);
  const boardId = useBoardStore((state) => state.activeBoardId) ?? "";
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId) ?? "";

  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Tránh SSR Mismatch khi render React Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Kết nối Socket Realtime theo scope TASK
  const { emitSendMessage } = useChatSocket(ChatScope.TASK, task?.id || "");

  // 3. Tích hợp React Query
  const { data: messagesData, isLoading: isLoadingMessages } = useGetMessages(
    ChatScope.TASK,
    task?.id || "",
  );
  const sendMessageMutation = useSendMessage();

  const messages = messagesData?.items || [];

  // Lấy ID của người dùng hiện tại (hỗ trợ cả id lẫn _id)
  const currentUserId = String(user?.id || (user as any)?._id || "");

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

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen || !mounted || !task) return null;

  const currentUserName = user?.name || "Me";

  // Xử lý Gửi tin nhắn qua Socket / HTTP API
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const payload = {
      scope: ChatScope.TASK,
      taskId: task.id,
      boardId: boardId || undefined,
      workspaceId: workspaceId || undefined,
      content: inputText.trim(),
    };

    try {
      if (emitSendMessage) {
        emitSendMessage(currentUserId, payload);
      } else {
        await sendMessageMutation.mutateAsync(payload);
      }
      setInputText("");
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    }
  };

  // Upload file giả lập cho giao diện
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
                {task.title}
              </h2>
              <p className="text-[11px] text-slate-400">Chi tiết công việc & Thảo luận</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body grid */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* CỘT TRÁI: Messenger Chat UI */}
          <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/30 min-w-0">
            <div className="px-4 py-2 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40 shrink-0">
              <span className="text-xs font-medium text-slate-300">Thảo luận</span>
              <span className="text-[11px] text-slate-500">
                {messages.length} tin nhắn
              </span>
            </div>

            {/* Khung tin nhắn */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {isLoadingMessages ? (
                <div className="flex h-full items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs">Đang tải tin nhắn...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-slate-500 text-xs">
                  Chưa có tin nhắn nào trong công việc này.
                </div>
              ) : (
                messages.map((msg) => {
                  // Lấy ID người gửi từ backend (hỗ trợ cả object sender lẫn string senderId / sender._id)
                  const senderId = String(
                    msg.sender?.id || msg.sender?._id || (msg as any).senderId || "",
                  );

                  // Kiểm tra tin nhắn có phải của chính mình gửi hay không
                  const isMe = Boolean(currentUserId && senderId === currentUserId);

                  const senderName = msg.sender?.name || "Người dùng";

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${
                        isMe ? "flex-row-reverse" : "flex-row"
                      }`}>
                      {/* Avatar người gửi (chỉ hiển thị nếu là tin nhắn của người khác) */}
                      {!isMe && (
                        <UserAvatar
                          name={senderName}
                          image={msg.sender?.image}
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
                            <div className="mt-2 space-y-1.5">
                              {msg.attachments.map((att, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                                    isMe
                                      ? "bg-blue-700/60 text-white"
                                      : "bg-slate-900/80 text-slate-200"
                                  }`}>
                                  <FileText className="w-4 h-4 shrink-0 text-amber-400" />
                                  <span className="truncate font-medium">
                                    {att.name || "Tập tin đính kèm"}
                                  </span>
                                </div>
                              ))}
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
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Form Soạn Tin nhắn */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-slate-800 bg-slate-900/80 shrink-0">
              <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/70 rounded-full px-3 py-1 focus-within:border-blue-500 transition-colors">
                <label className="cursor-pointer p-1.5 text-slate-400 hover:text-blue-400 transition-colors">
                  <Paperclip className="w-4 h-4" />
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>

                <button
                  type="button"
                  className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors">
                  <ImageIcon className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Viết tin nhắn..."
                  className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none px-2 min-w-0"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || sendMessageMutation.isPending}
                  className="p-1.5 sm:p-2 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-all shrink-0">
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* CỘT PHẢI: Info Task & Files */}
          <div className="w-full md:w-80 p-4 flex flex-col gap-4 overflow-y-auto bg-slate-900/60 shrink-0">
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Thông tin thẻ
              </h3>

              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 space-y-2.5 text-xs">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                    <UserIcon className="w-3.5 h-3.5" /> Người thực hiện:
                  </span>
                  <span className="font-medium text-slate-200 truncate">
                    {task.assignee ? task.assignee.name : "Chưa giao"}
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
                  <input type="file" className="hidden" onChange={handleFileUpload} />
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
