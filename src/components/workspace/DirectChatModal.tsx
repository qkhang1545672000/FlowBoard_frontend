/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Send,
  Paperclip,
  Loader2,
  FileText,
  Download,
  GripHorizontal,
} from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useQueryClient } from "@tanstack/react-query";
import UserAvatar from "@/components/ui/UserAvatar";
import { ChatScope, ChatAttachment, ChatMessage } from "@/services/chat.service";
import { useGetMessages, useSendMessage } from "@/hooks/useChat";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useAuthStore } from "@/store/useAuthStore";
import { User } from "@/types/api.types";

interface DirectChatModalProps {
  recipient: User;
  onClose: () => void;
}

export const DirectChatModal = ({ recipient, onClose }: DirectChatModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  // Các mốc tham chiếu DOM để điều khiển thanh cuộn
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State quản lý vị trí kéo thả (Draggable) của Modal
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const currentUser = useAuthStore((state) => state.user);
  const scrollStorageKey = `chat-scroll-direct-${recipient.id}`;

  const scope = ChatScope.DIRECT;
  const targetId = recipient.id;

  // Đảm bảo Portal chỉ render ở phía Client (tránh lỗi SSR của Next.js)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Dùng React Query lấy danh sách tin nhắn 1-1
  const {
    data: messagesData,
    isLoading: isMessagesLoading,
    fetchNextPage,
    hasNextPage,
  } = useGetMessages(scope, targetId);

  // 2. Hook mutation gửi tin nhắn (dùng khi có file đính kèm)
  const { mutate: sendMessageMutation, isPending: isSending } = useSendMessage();

  // 3. Kết nối Socket Realtime cho phòng 1-1 này
  const { emitSendMessage } = useChatSocket(scope, targetId);

  // Gom và lọc trùng lặp tin nhắn
  const rawMessages = messagesData?.pages?.flatMap((page) => page.items || []) || [];

  const messages = Array.from(
    new Map(rawMessages.map((m: any) => [m.id, m])).values(),
  ).sort(
    (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  // Đảo ngược mảng để dùng với giao diện flex-col-reverse (tin mới nằm ở đáy)
  const reversedMessages = [...messages].reverse();

  // Tự động kéo màn hình cuộn xuống tận đáy khi mở modal
  useLayoutEffect(() => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [recipient.id]);

  // Lưu vị trí cuộn
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

  // Khôi phục vị trí cuộn khi tải thêm tin nhắn cũ
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

  // Xử lý sự kiện kéo thả (Drag & Drop) Modal qua Header
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      setPosition({
        x: moveEvent.clientX - dragStartRef.current.x,
        y: moveEvent.clientY - dragStartRef.current.y,
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Xử lý chọn file đính kèm
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
    e.target.value = "";
  };

  // Xóa bớt file đã chọn nhầm
  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Gửi tin nhắn
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && selectedFiles.length === 0) || !currentUser) return;

    try {
      if (selectedFiles.length > 0) {
        const payload = {
          scope,
          recipientId: targetId,
          content: content.trim(),
          files: selectedFiles,
        };

        const res = await sendMessageMutation(payload as any);

        if (res) {
          queryClient.setQueryData(["messages", scope, targetId], (oldData: any) => {
            if (!oldData) return { pages: [{ items: [res] }], pageParams: [1] };
            const pages = [...oldData.pages];
            if (pages.length > 0) {
              const exists = pages[0].items?.some((m: any) => m.id === res.id);
              if (!exists) {
                pages[0] = {
                  ...pages[0],
                  items: [...(pages[0].items || []), res],
                };
              }
            }
            return { ...oldData, pages };
          });
        }
      } else {
        const dto = {
          scope,
          recipientId: targetId,
          content: content.trim(),
        };

        if (currentUser.id) {
          emitSendMessage(currentUser.id, dto);
        } else {
          const res = await sendMessageMutation(dto as any);
          if (res) {
            queryClient.setQueryData(["messages", scope, targetId], (oldData: any) => {
              if (!oldData) return { pages: [{ items: [res] }], pageParams: [1] };
              const pages = [...oldData.pages];
              if (pages.length > 0) {
                pages[0] = {
                  ...pages[0],
                  items: [...(pages[0].items || []), res],
                };
              }
              return { ...oldData, pages };
            });
          }
        }
      }

      setContent("");
      setSelectedFiles([]);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn 1-1:", error);
    }
  };

  // Nếu chưa mount trên client thì không render gì cả
  if (!mounted) return null;

  // Sử dụng createPortal để đưa khung chat ra ngoài body
  return createPortal(
    <div
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      className="fixed bottom-4 right-4 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-[9999] flex flex-col overflow-hidden backdrop-blur-lg">
      {/* --- HEADER KHUNG CHAT (KÉO THẢ TỪ ĐÂY) --- */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700 cursor-move select-none">
        <div className="flex items-center gap-2.5 min-w-0 pointer-events-none">
          <GripHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="relative shrink-0">
            <UserAvatar name={recipient.name} type="chat" avatarUrl={recipient.image} />
            <span
              className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-slate-900 ${
                recipient.isOnline ? "bg-emerald-500" : "bg-slate-500"
              }`}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-white truncate">
              {recipient.name}
            </h3>
            <p className="text-[10px] text-slate-400">
              {recipient.isOnline ? "Đang hoạt động" : "Offline"}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* --- DANH SÁCH TIN NHẮN --- */}
      {isMessagesLoading ? (
        <div className="flex justify-center items-center h-[300px] flex-1">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 p-6 text-center text-slate-500 my-auto text-xs flex flex-col items-center justify-center min-h-[250px]">
          Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện với {recipient.name}!
        </div>
      ) : (
        <div
          id={`directScrollableDiv-${recipient.id}`}
          ref={containerRef}
          onScroll={handleScrollSave}
          className="flex-1 p-3 overflow-y-auto max-h-[350px] min-h-[250px] flex flex-col-reverse relative beautiful-scrollbar bg-slate-950/50">
          <div ref={messagesEndRef} />

          <InfiniteScroll
            dataLength={messages.length}
            next={fetchNextPage}
            hasMore={hasNextPage ?? false}
            scrollableTarget={`directScrollableDiv-${recipient.id}`}
            loader={
              <p className="text-center text-[10px] py-2 text-slate-400">
                Đang tải thêm tin nhắn...
              </p>
            }
            inverse={true}
            style={{
              display: "flex",
              flexDirection: "column-reverse",
              overflow: "visible",
            }}>
            {reversedMessages.map((msg: ChatMessage, index: number) => {
              const isMe = msg.sender?.id === currentUser?.id;
              const timeString = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={msg.id || index}
                  className={`flex flex-col max-w-[80%] mb-3 ${
                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                  }`}>
                  <div
                    className={`px-3 py-2 rounded-xl text-xs break-words ${
                      isMe
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50"
                    }`}>
                    {msg.content && <p>{msg.content}</p>}

                    {/* Hiển thị tệp đính kèm / hình ảnh */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
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
                              className="block max-w-[180px] rounded-lg overflow-hidden border border-slate-700 hover:opacity-90 transition-opacity">
                              <img
                                src={attUrl}
                                alt={attName}
                                className="w-full h-auto object-cover max-h-[130px]"
                              />
                            </a>
                          ) : (
                            <a
                              key={idx}
                              href={attUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-indigo-300 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-all flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="truncate max-w-[140px] font-medium text-white underline">
                                {attName}
                              </span>
                              <Download className="w-3 h-3 text-slate-400 shrink-0 ml-0.5" />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-0.5 px-1">
                    {timeString}
                  </span>
                </div>
              );
            })}
          </InfiniteScroll>
        </div>
      )}

      {/* --- DANH SÁCH FILE ĐANG CHỌN ĐÍNH KÈM TRƯỚC KHI GỬI --- */}
      {selectedFiles.length > 0 && (
        <div className="px-3 py-2 border-t border-slate-800 bg-slate-900/90 flex flex-wrap gap-1.5 shrink-0">
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-[11px] text-slate-200">
              <FileText className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="truncate max-w-[140px]">{file.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveSelectedFile(idx)}
                className="text-slate-400 hover:text-red-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input ẩn để chọn file */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={handleFileSelect}
      />

      {/* --- KHUNG NHẬP TIN NHẮN --- */}
      <form
        onSubmit={handleSend}
        className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Đính kèm file"
          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-colors">
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            selectedFiles.length > 0
              ? `Đã chọn ${selectedFiles.length} file...`
              : "Nhập tin nhắn..."
          }
          className="flex-1 bg-slate-800 text-xs text-white placeholder-slate-500 px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-slate-700/50"
        />

        <button
          type="submit"
          disabled={(!content.trim() && selectedFiles.length === 0) || isSending}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center">
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>,
    document.body,
  );
};
