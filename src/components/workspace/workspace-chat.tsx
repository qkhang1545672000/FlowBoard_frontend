/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useLayoutEffect, useRef } from "react";
import {
  Send,
  Hash,
  Smile,
  Paperclip,
  Loader2,
  ShieldCheck,
  Crown,
  X,
  FileText,
  Download,
} from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import UserAvatar from "../ui/UserAvatar";
import { ChatScope, ChatMessage } from "@/services/chat.service";
import { useGetMessages, useSendMessage } from "@/hooks/useChat";
import { useChatSocket } from "@/hooks/useChatSocket";
import { WorkspaceMember } from "@/types/workSpace";
import { WorkspaceRole } from "@/types";

interface WorkspaceChatProps {
  workspaceId: string;
  userId?: string;
  workspaceMembers?: WorkspaceMember[];
}

export const WorkspaceChat = ({
  workspaceId,
  userId,
  workspaceMembers = [],
}: WorkspaceChatProps) => {
  const [chatMessage, setChatMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scope = ChatScope.WORKSPACE;
  const targetId = workspaceId;

  // 1. Lấy danh sách tin nhắn qua Infinite Query
  const {
    data: messagesData,
    isLoading: isMessagesLoading,
    fetchNextPage,
    hasNextPage,
  } = useGetMessages(scope, targetId);

  // Gộp tất cả các trang tin nhắn lại từ infinite query
  const rawMessages = messagesData?.pages?.flatMap((page) => page.items || []) || [];

  // KHỬ TRÙNG LẶP VÀ SẮP XẾP CHUẨN THEO THỜI GIAN (Cũ nhất -> Mới nhất)
  const messages = Array.from(
    new Map(rawMessages.map((m: any) => [m.id, m])).values(),
  ).sort(
    (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  /**
   * Đảo ngược mảng tin nhắn:
   * Vì API trả về tin nhắn theo thứ tự Mới -> Cũ, nhưng khi render giao diện với Flexbox 'flex-col-reverse'
   * ta cần đảo mảng lại để tin nhắn mới nhất nằm ở đáy màn hình.
   */
  const reversedMessages = [...messages].reverse();

  // 2. Hook gửi tin nhắn (Mutation)
  const { mutate: sendMessageMutation, isPending: isSending } = useSendMessage();

  // 3. Kết nối WebSocket Real-time
  const { emitSendMessage } = useChatSocket(scope, targetId);

  // Tạo key duy nhất để lưu vị trí cuộn vào sessionStorage cho workspace này
  const scrollStorageKey = `chat-scroll-workspace-${targetId}`;

  // REFS: Dùng để tham chiếu đến các thẻ HTML DOM
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Tự động cuộn xuống đáy khi mở lần đầu hoặc đổi workspace
   */
  useLayoutEffect(() => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [targetId]);

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

  // Xử lý chọn file từ máy tính
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

  // Xử lý gửi tin nhắn kèm text & file
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!chatMessage.trim() && selectedFiles.length === 0) || !targetId) return;

    try {
      if (selectedFiles.length > 0) {
        // Nếu có chọn file, bắt buộc phải dùng HTTP Mutation (Multipart Form-data) để upload tệp
        const payload = {
          scope,
          workspaceId: targetId,
          content: chatMessage.trim(),
          files: selectedFiles,
        };
        await sendMessageMutation(payload as any);
      } else {
        // Nếu chỉ là text thông thường, dùng WebSocket realtime qua emitSendMessage
        const dto = {
          scope,
          workspaceId: targetId,
          content: chatMessage.trim(),
        };

        if (userId) {
          emitSendMessage(userId, dto);
        } else {
          await sendMessageMutation(dto as any);
        }
      }

      setChatMessage("");
      setSelectedFiles([]);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Lỗi gửi tin nhắn workspace kèm file:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden min-h-[500px]">
      {/* Header kênh chat */}
      <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center gap-2 shrink-0">
        <Hash className="w-5 h-5 text-indigo-400" />
        <span className="font-semibold text-white">thông-báo-workspace</span>
        <span className="text-xs text-slate-500 border-l border-slate-700 pl-2 ml-1">
          Kênh trò chuyện chung của toàn bộ thành viên workspace
        </span>
      </div>

      {/* Danh sách tin nhắn / Màn hình chờ */}
      {isMessagesLoading ? (
        <div className="flex justify-center items-center py-10 flex-1">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex flex-col p-5 overflow-y-auto">
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-1 shrink-0 mb-4">
            <h3 className="text-indigo-300 font-semibold text-base flex items-center gap-2">
              <Hash className="w-5 h-5" /> Chào mừng bạn đến với kênh chat Workspace!
            </h3>
            <p className="text-xs text-slate-400">
              Đây là không gian trao đổi thông tin chính thức của toàn bộ thành viên trong
              workspace này.
            </p>
          </div>
          <div className="text-center py-12 text-slate-500 text-xs flex-1 flex items-center justify-center">
            Chưa có tin nhắn nào trong workspace này. Hãy bắt đầu trò chuyện!
          </div>
        </div>
      ) : (
        /* Khung chứa danh sách cuộn chính */
        <div
          id="workspaceScrollableDiv"
          ref={containerRef}
          onScroll={handleScrollSave}
          className="flex-1 p-5 overflow-y-auto overflow-x-hidden flex flex-col-reverse relative beautiful-scrollbar">
          {/* Thẻ div rỗng nằm ở dưới cùng để làm mốc cuộn */}
          <div ref={messagesEndRef} />

          {/* Component hỗ trợ cuộn vô tận (Infinite Scroll) */}
          <InfiniteScroll
            dataLength={messages.length}
            next={fetchNextPage}
            hasMore={hasNextPage ?? false}
            scrollableTarget="workspaceScrollableDiv"
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
              const isMe = msg.sender?.id === userId;
              const timeString = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              const senderMember = workspaceMembers.find(
                (m) => m.user?.id === msg.sender?.id,
              );
              const isOwner = senderMember?.role === "OWNER";
              const isLeader = senderMember?.role === WorkspaceRole.LEADER_WORKSPACE;

              return (
                <div
                  key={msg.id || index}
                  className={`flex items-start gap-3 mb-4 ${
                    isMe ? "justify-end" : "justify-start"
                  }`}>
                  {!isMe && (
                    <div
                      className={`relative shrink-0 rounded-full p-0.5 ${
                        isOwner
                          ? "ring-2 ring-indigo-500 shadow-sm shadow-indigo-500/30"
                          : isLeader
                            ? "ring-2 ring-amber-400 shadow-sm shadow-amber-400/30"
                            : ""
                      }`}>
                      <UserAvatar name={msg.sender?.name || "User"} type="chat" />
                      {isOwner && (
                        <ShieldCheck className="w-3 h-3 text-indigo-400 absolute -bottom-0.5 -right-0.5 fill-slate-950" />
                      )}
                      {isLeader && (
                        <Crown className="w-3 h-3 text-amber-400 absolute -bottom-0.5 -right-0.5 fill-amber-400" />
                      )}
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
                            {msg.sender?.name || "Thành viên"}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-sm text-white">
                            {msg.sender?.name || "Thành viên"}
                          </span>
                          {isOwner && (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" /> Owner
                            </span>
                          )}
                          {isLeader && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />{" "}
                              Leader
                            </span>
                          )}

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

                    {/* Hiển thị danh sách file/ảnh đính kèm trong tin nhắn */}
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

                          // Kiểm tra nếu là ảnh
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
                    <div
                      className={`relative shrink-0 rounded-full p-0.5 ${
                        isOwner
                          ? "ring-2 ring-indigo-500 shadow-sm shadow-indigo-500/30"
                          : isLeader
                            ? "ring-2 ring-amber-400 shadow-sm shadow-amber-400/30"
                            : ""
                      }`}
                      title={`${msg.sender?.name || "User"} ${
                        isOwner ? "(Owner)" : isLeader ? "(Leader)" : ""
                      }`}>
                      <UserAvatar name={msg.sender?.name || "User"} type="chat" />
                      {isOwner && (
                        <ShieldCheck className="w-3 h-3 text-indigo-400 absolute -bottom-0.5 -right-0.5 fill-slate-950" />
                      )}
                      {isLeader && (
                        <Crown className="w-3 h-3 text-amber-400 absolute -bottom-0.5 -right-0.5 fill-amber-400" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </InfiniteScroll>
        </div>
      )}

      {/* Khu vực hiển thị file/ảnh đang chọn trước khi gửi */}
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
                className="text-slate-400 hover:text-red-400 transition-colors">
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

      {/* Khung nhập tin nhắn */}
      <form
        onSubmit={handleSendChat}
        className="p-4 border-t border-slate-800 bg-slate-900/60 shrink-0">
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
            placeholder="Gửi tin nhắn tới workspace..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
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
};
