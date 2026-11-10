/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useLayoutEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Send, Paperclip, FileText, Download, Loader2, X, Smile } from "lucide-react";
import UserAvatar from "../../ui/UserAvatar";
import { ChatScope } from "@/services/chat.service";
import { useGetMessages, useSendMessage } from "@/hooks/useChat";
import { useChatSocket } from "@/hooks/useChatSocket";

interface TaskChatSectionProps {
  taskId: string;
  boardId: string;
  workspaceId: string;
  currentUserId: string;
  currentUserImage?: string;
  isOpen: boolean;
}

export function TaskChatSection({
  taskId,
  boardId,
  workspaceId,
  currentUserId,
  currentUserImage,
  isOpen,
}: TaskChatSectionProps) {
  const [chatMessage, setChatMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scope = ChatScope.TASK;
  const targetId = taskId;

  // 1. Kết nối Socket Realtime theo scope TASK
  const { emitSendMessage } = useChatSocket(scope, targetId);

  // 2. Lấy danh sách tin nhắn qua Infinite Query
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    fetchNextPage,
    hasNextPage,
  } = useGetMessages(scope, targetId);

  const { mutate: sendMessageMutation, isPending: isSending } = useSendMessage();

  // Gộp tất cả các trang tin nhắn và khử trùng lặp
  const rawMessages = messagesData?.pages?.flatMap((page) => page.items || []) || [];
  const messages = Array.from(
    new Map(rawMessages.map((m: any) => [m.id, m])).values(),
  ).sort(
    (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const reversedMessages = [...messages].reverse();

  // Tạo key lưu vị trí cuộn
  const scrollStorageKey = `chat-scroll-task-${targetId}`;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [isOpen, targetId]);

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

  const handleChatFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
    e.target.value = "";
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

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

  if (isLoadingMessages) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400 gap-2 flex-1">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
        <span className="text-xs">Đang tải tin nhắn...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-900/30">
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-slate-500 text-xs flex-1">
          Chưa có tin nhắn nào trong công việc này. Hãy bắt đầu trò chuyện!
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
            {reversedMessages.map((msg: any, index: number) => {
              const senderId = String(msg.sender?.id || msg.senderId || "");
              const isMe = Boolean(currentUserId && senderId === currentUserId);
              const senderName = msg.sender?.name || "Người dùng";
              const timeString = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

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
                          <span className="text-[10px] text-slate-500">{timeString}</span>
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
                          <span className="text-[10px] text-slate-500">{timeString}</span>
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

                    {/* Hiển thị file/ảnh đính kèm */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div
                        className={`flex flex-wrap gap-2 mt-2 ${
                          isMe ? "justify-end" : "justify-start"
                        }`}>
                        {msg.attachments.map((att: any, idx: number) => {
                          const attUrl = typeof att === "string" ? att : att?.url || "";
                          const attName =
                            typeof att === "string"
                              ? attUrl.split("/").pop() || "Tệp đính kèm"
                              : att?.name || attUrl.split("/").pop() || "Tệp đính kèm";
                          const attType = typeof att === "string" ? "" : att?.type || "";

                          const isImage =
                            /\.(jpeg|jpg|gif|png|webp|avif|svg)$/i.test(attUrl) ||
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
                        avatarUrl={currentUserImage}
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

      {/* File preview trước khi gửi */}
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

      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={handleChatFileSelect}
      />

      {/* Khung nhập tin nhắn */}
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
            disabled={isSending || (!chatMessage.trim() && selectedFiles.length === 0)}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-1.5 rounded-lg transition-all cursor-pointer">
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
