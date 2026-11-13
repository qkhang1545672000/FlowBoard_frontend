/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  Smile,
  Loader2,
  FileText,
  Download,
} from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import UserAvatar from "@/components/ui/UserAvatar";
import { ChatScope, ChatMessage } from "@/services/chat.service";
import { useGetMessages, useSendMessage } from "@/hooks/useChat";
import { useChatSocket } from "@/hooks/useChatSocket";

interface BoardChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardTitle: string;
  boardId: string;
  user: any;
  boardMembers?: any[];
}

export function BoardChatModal({
  isOpen,
  onClose,
  boardTitle,
  boardId,
  user,
  boardMembers = [],
}: BoardChatModalProps) {
  const [chatMessage, setChatMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scope = ChatScope.BOARD;
  const targetId = boardId;

  const {
    data: messagesData,
    isLoading: isMessagesLoading,
    fetchNextPage,
    hasNextPage,
  } = useGetMessages(scope, targetId);

  const { mutate: sendMessageMutation, isPending: isSending } = useSendMessage();
  const { emitSendMessage } = useChatSocket(scope, targetId);

  const rawMessages = messagesData?.pages?.flatMap((page) => page.items || []) || [];
  const messages = Array.from(
    new Map(rawMessages.map((m: any) => [m.id, m])).values(),
  ).sort(
    (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const reversedMessages = [...messages].reverse();

  const scrollStorageKey = `chat-scroll-board-${targetId}`;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
          boardId: targetId,
          content: chatMessage.trim(),
          files: selectedFiles,
        };
        await sendMessageMutation(payload as any);
      } else {
        const dto = {
          scope,
          boardId: targetId,
          content: chatMessage.trim(),
        };

        if (user?.id) {
          emitSendMessage(user.id, dto);
        } else {
          await sendMessageMutation(dto as any);
        }
      }

      setChatMessage("");
      setSelectedFiles([]);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Lỗi gửi tin nhắn board kèm file:", error);
    }
  };

  if (!isOpen) return null;

  return (
    /* Thêm onClick={onClose} ở lớp nền ngoài cùng */
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Thêm onClick={(e) => e.stopPropagation()} để chặn sự kiện nổi bọt khi click vào bên trong modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 w-full max-w-3xl h-[680px] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-2xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Kênh Chat Bảng: {boardTitle}
              </h2>
              <p className="text-xs text-slate-400">
                Trao đổi trực tuyến giữa các thành viên trong bảng dự án
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung danh sách tin nhắn */}
        {isMessagesLoading ? (
          <div className="flex justify-center items-center py-10 flex-1">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-1 shrink-0 mb-4">
              <h3 className="text-indigo-300 font-semibold text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Chào mừng bạn đến với kênh chat
                Board!
              </h3>
              <p className="text-xs text-slate-400">
                Đây là không gian trao đổi thông tin thời gian thực của các thành viên
                trong bảng này.
              </p>
            </div>
            <div className="text-center py-12 text-slate-500 text-xs flex-1 flex items-center justify-center">
              Chưa có tin nhắn nào trong bảng này. Hãy bắt đầu cuộc trò chuyện!
            </div>
          </div>
        ) : (
          <div
            id="boardScrollableDiv"
            ref={containerRef}
            onScroll={handleScrollSave}
            className="flex-1 p-6 overflow-y-auto overflow-x-hidden flex flex-col-reverse relative space-y-4 space-y-reverse">
            <div ref={messagesEndRef} />

            <InfiniteScroll
              dataLength={messages.length}
              next={fetchNextPage}
              hasMore={hasNextPage ?? false}
              scrollableTarget="boardScrollableDiv"
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
              {reversedMessages.map((msg: ChatMessage, index: number) => {
                const isMe = msg.sender?.id === user?.id;
                const timeString = new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const senderName = isMe ? "Bạn" : msg.sender?.name || "Thành viên";
                const senderAvatar =
                  msg.sender?.image ||
                  msg.sender?.image ||
                  (isMe ? user?.avatar : undefined);

                return (
                  <div
                    key={msg.id || index}
                    className={`flex items-start gap-3 mb-4 ${
                      isMe ? "flex-row-reverse" : "flex-row"
                    }`}>
                    {/* Avatar */}
                    <div className="shrink-0 mt-0.5">
                      <UserAvatar
                        name={senderName}
                        type="chat"
                        avatarUrl={senderAvatar}
                      />
                    </div>

                    {/* Khung chứa tên, thời gian và nội dung */}
                    <div
                      className={`flex flex-col max-w-[75%] ${
                        isMe ? "items-end" : "items-start"
                      }`}>
                      {/* Tên & Thời gian */}
                      <div
                        className={`flex items-center gap-2 mb-1 px-1 ${
                          isMe ? "flex-row-reverse" : "flex-row"
                        }`}>
                        <span className="text-xs font-medium text-slate-300">
                          {senderName}
                        </span>
                        <span className="text-[10px] text-slate-500">{timeString}</span>
                      </div>

                      {/* Nội dung text */}
                      {msg.content && (
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm break-words ${
                            isMe
                              ? "bg-indigo-600 text-white rounded-tr-xs"
                              : "bg-slate-800 text-slate-200 rounded-tl-xs border border-slate-700/60"
                          }`}>
                          {msg.content}
                        </div>
                      )}

                      {/* File đính kèm / hình ảnh */}
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
                            const attType =
                              typeof att === "string" ? "" : att?.type || "";

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
                                className="block max-w-[220px] rounded-2xl overflow-hidden border border-slate-700 hover:opacity-90 transition-opacity shadow-md">
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
                                className="text-xs text-indigo-300 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm">
                                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                                <span className="truncate max-w-[160px] font-medium text-white underline">
                                  {attName}
                                </span>
                                <Download className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </InfiniteScroll>
          </div>
        )}

        {/* Danh sách file đang chọn chờ gửi */}
        {selectedFiles.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/90 flex flex-wrap gap-2 shrink-0">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-200">
                <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate max-w-[160px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSelectedFile(idx)}
                  className="text-slate-400 hover:text-red-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Thẻ input chọn file ẩn */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          className="hidden"
          onChange={handleChatFileSelect}
        />

        {/* Form nhập & gửi tin nhắn */}
        <form
          onSubmit={handleSendChat}
          className="p-4 border-t border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 focus-within:border-indigo-500 transition-all">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
              title="Đính kèm tệp, ảnh...">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Nhập tin nhắn trao đổi công việc..."
              className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none px-2 py-1.5"
            />
            <button
              type="button"
              className="text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
              <Smile className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={isSending || (!chatMessage.trim() && selectedFiles.length === 0)}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/20 flex items-center justify-center">
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
