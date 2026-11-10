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
  Smile,
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

  // Hook update task tổng quát
  const { mutate: updateTask, isPending: isPendingUpdateTask } = useUpdateTask(boardId);

  const [chatMessage, setChatMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State quản lý Tab đang active ("discussion" hoặc "checklist")
  const [activeTab, setActiveTab] = useState<"discussion" | "checklist">("discussion");

  // 1. Tránh SSR Mismatch khi render React Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  const scope = ChatScope.TASK;
  const targetId = task?.id || "";

  // 2. Kết nối Socket Realtime theo scope TASK
  const { emitSendMessage } = useChatSocket(scope, targetId);

  // 3. Tích hợp React Query cho chat (dùng useInfiniteQuery)
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    fetchNextPage,
    hasNextPage,
  } = useGetMessages(scope, targetId);

  // Gộp tất cả các trang tin nhắn lại từ infinite query
  const rawMessages = messagesData?.pages?.flatMap((page) => page.items || []) || [];

  // Khử trùng lặp và sắp xếp chuẩn theo thời gian (Cũ nhất -> Mới nhất)
  const messages = Array.from(
    new Map(rawMessages.map((m: any) => [m.id, m])).values(),
  ).sort(
    (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  // Đảo ngược mảng để render với flex-col-reverse
  const reversedMessages = [...messages].reverse();

  // Hook gửi tin nhắn HTTP (Mutation) - Dùng khi gửi kèm file/ảnh
  const { mutate: sendMessageMutation, isPending: isSending } = useSendMessage();

  // Lấy ID của người dùng hiện tại
  const currentUserId = String(user?.id || (user as any)?._id || "");

  // Tạo key duy nhất để lưu vị trí cuộn vào sessionStorage cho task này
  const scrollStorageKey = `chat-scroll-task-${targetId}`;

  // REFS: Dùng để tham chiếu đến các thẻ HTML DOM
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Tự động cuộn xuống đáy khi mở modal lần đầu hoặc đổi task
   */
  useLayoutEffect(() => {
    if (isOpen && activeTab === "discussion" && messagesEndRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [isOpen, activeTab, targetId]);

  /**
   * Lưu vị trí cuộn hiện tại vào sessionStorage khi người dùng cuộn
   */
  const handleScrollSave = () => {
    const container = containerRef.current;
    if (!container || !targetId) return;

    sessionStorage.setItem(
      scrollStorageKey,
      JSON.stringify({
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
      }),
    );
  };

  /**
   * Khôi phục vị trí cuộn sau khi tải thêm tin nhắn cũ để không bị giật màn hình
   */
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  // Xử lý chọn file từ máy tính cho phần chat
  const handleChatFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
    e.target.value = "";
  };

  // Xóa file đang chọn trước khi gửi
  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Xử lý gửi tin nhắn kèm text & file (Hỗ trợ cả WebSocket text và HTTP Multipart khi có file)
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!chatMessage.trim() && selectedFiles.length === 0) || !targetId) return;

    try {
      if (selectedFiles.length > 0) {
        const payload = {
          scope,
          taskId: targetId,
          boardId: boardId || undefined,
          workspaceId: workspaceId || undefined,
          content: chatMessage.trim(),
          files: selectedFiles,
        };
        await sendMessageMutation(payload as any);
      } else {
        const dto = {
          scope,
          taskId: targetId,
          boardId: boardId || undefined,
          workspaceId: workspaceId || undefined,
          content: chatMessage.trim(),
        };

        if (currentUserId && emitSendMessage) {
          emitSendMessage(currentUserId, dto);
        } else {
          await sendMessageMutation(dto as any);
        }
      }

      setChatMessage("");
      setSelectedFiles([]);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Lỗi gửi tin nhắn task kèm file:", error);
    }
  };

  // Upload file giả lập cho giao diện cột phải
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
            {/* Nút Hoàn thành / Đã hoàn thành */}
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

            {/* Nút Đóng Modal */}
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
            {/* Header Tabs */}
            <div className="px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40 shrink-0">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setActiveTab("discussion")}
                  className={`text-xs font-medium pb-0.5 transition-colors relative cursor-pointer ${
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

            {/* CONTENT TAB 1: THẢO LUẬN */}
            {activeTab === "discussion" && (
              <>
                {/* Khung tin nhắn */}
                {isLoadingMessages ? (
                  <div className="flex h-full items-center justify-center text-slate-400 gap-2 flex-1">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    <span className="text-xs">Đang tải tin nhắn...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-slate-500 text-xs flex-1">
                    Chưa có tin nhắn nào trong công việc này. Hãy bắt đầu trò chuyện!
                  </div>
                ) : (
                  <div
                    id="taskScrollableDiv"
                    ref={containerRef}
                    onScroll={handleScrollSave}
                    className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col-reverse relative beautiful-scrollbar">
                    {/* Thẻ div rỗng nằm ở dưới cùng để làm mốc cuộn */}
                    <div ref={messagesEndRef} />

                    {/* Component hỗ trợ cuộn vô tận (Infinite Scroll) */}
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
                      {reversedMessages.map((msg: any, index: number) => {
                        const senderId = String(msg.sender?.id || msg.senderId || "");
                        const isMe = Boolean(currentUserId && senderId === currentUserId);
                        const senderName = msg.sender?.name || "Người dùng";
                        const timeString = new Date(msg.createdAt).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        );

                        return (
                          <div
                            key={msg.id || index}
                            className={`flex items-start gap-3 mb-4 ${
                              isMe ? "justify-end" : "justify-start"
                            }`}>
                            {!isMe && (
                              <div className="relative shrink-0 rounded-full p-0.5">
                                <UserAvatar
                                  name={senderName}
                                  avatarUrl={msg.sender?.image}
                                  type="chat"
                                />
                              </div>
                            )}

                            <div
                              className={`space-y-1 max-w-xl flex flex-col ${
                                isMe ? "items-end" : "items-start"
                              }`}>
                              <div className="flex items-center gap-2">
                                {isMe ? (
                                  <>
                                    <span className="text-[10px] text-slate-500">
                                      {timeString}
                                    </span>
                                    <span className="px-1.5 py-0.5 bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 text-[10px] font-semibold rounded-md">
                                      Bạn
                                    </span>
                                    <span className="font-medium text-sm text-white">
                                      {senderName}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="font-medium text-sm text-white">
                                      {senderName}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                      {timeString}
                                    </span>
                                  </>
                                )}
                              </div>

                              {msg.content && (
                                <p
                                  className={`text-sm p-3 rounded-2xl border break-words inline-block ${
                                    isMe
                                      ? "bg-indigo-600 text-white rounded-tr-none border-indigo-500/50 shadow-md text-right"
                                      : "bg-slate-800/60 text-slate-300 rounded-tl-none border-slate-700/50 text-left"
                                  }`}>
                                  {msg.content}
                                </p>
                              )}

                              {/* Hiển thị danh sách file/ảnh đính kèm trong tin nhắn chuẩn */}
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div
                                  className={`flex flex-wrap gap-2 mt-2 ${
                                    isMe ? "justify-end" : "justify-start"
                                  }`}>
                                  {msg.attachments.map((att: any, idx: number) => {
                                    const attUrl =
                                      typeof att === "string" ? att : att?.url || "";
                                    const attName =
                                      typeof att === "string"
                                        ? attUrl.split("/").pop() || "Tệp đính kèm"
                                        : att?.name ||
                                          attUrl.split("/").pop() ||
                                          "Tệp đính kèm";
                                    const attType =
                                      typeof att === "string" ? "" : att?.type || "";

                                    const isImage =
                                      /\.(jpeg|jpg|gif|png|webp|avif|svg)$/i.test(
                                        attUrl,
                                      ) ||
                                      attType.startsWith("image/") ||
                                      attUrl.includes("/image/upload/");

                                    return isImage ? (
                                      <a
                                        key={idx}
                                        href={attUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block max-w-[220px] rounded-xl overflow-hidden border border-slate-700 hover:opacity-90 transition-opacity">
                                        <img
                                          src={attUrl}
                                          alt={attName}
                                          className="w-full h-auto object-cover max-h-[160px]"
                                        />
                                      </a>
                                    ) : (
                                      <a
                                        key={idx}
                                        href={attUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-indigo-300 bg-slate-800/90 px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-700/80 transition-all flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                                        <span className="truncate max-w-[180px] font-medium text-white underline">
                                          {attName}
                                        </span>
                                        <Download className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                                      </a>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {isMe && (
                              <div className="relative shrink-0 rounded-full p-0.5">
                                <UserAvatar
                                  name={senderName}
                                  avatarUrl={user?.image}
                                  type="chat"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </InfiniteScroll>
                  </div>
                )}

                {/* Khu vực hiển thị file đang chọn trước khi gửi */}
                {selectedFiles.length > 0 && (
                  <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/80 flex flex-wrap gap-2 shrink-0">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-200">
                        <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSelectedFile(idx)}
                          className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input ẩn để chọn file */}
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  className="hidden"
                  onChange={handleChatFileSelect}
                />

                {/* Form Soạn Tin nhắn */}
                <form
                  onSubmit={handleSendChat}
                  className="p-3 border-t border-slate-800 bg-slate-900/60 shrink-0">
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 focus-within:border-indigo-500 transition-all">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                      title="Đính kèm tệp, ảnh, zip, rar...">
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Gửi tin nhắn tới công việc..."
                      className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                    />

                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-200 cursor-pointer">
                      <Smile className="w-4 h-4" />
                    </button>

                    <button
                      type="submit"
                      disabled={
                        isSending || (!chatMessage.trim() && selectedFiles.length === 0)
                      }
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-1.5 rounded-lg transition-all cursor-pointer">
                      {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* CONTENT TAB 2: VIỆC CẦN LÀM */}
            {activeTab === "checklist" && <TaskChecklistTab task={task} />}
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

                    <button className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-lg transition-colors shrink-0 cursor-pointer">
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
