/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Hash, Smile, Paperclip, Loader2, ShieldCheck, Crown } from "lucide-react";
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

  const scope = ChatScope.WORKSPACE;
  const targetId = workspaceId;

  // 1. Lấy danh sách tin nhắn qua REST API
  const { data: messagesData, isLoading: isMessagesLoading } = useGetMessages(
    scope,
    targetId,
  );

  // 2. Hook gửi tin nhắn (Mutation)
  const { mutate: sendMessageMutation, isPending: isSending } = useSendMessage();

  // 3. Kết nối WebSocket Real-time
  const { emitSendMessage } = useChatSocket(scope, targetId);

  // Ref để tự động cuộn xuống tin nhắn mới nhất
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesData]);

  // Xử lý gửi tin nhắn
  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatMessage.trim() || !userId || !targetId) return;

    const dto = {
      scope,
      workspaceId: targetId,
      content: chatMessage.trim(),
    };

    if (userId) {
      emitSendMessage(userId, dto);
    } else {
      sendMessageMutation(dto);
    }

    setChatMessage("");
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden min-h-[500px]">
      {/* Header kênh chat */}
      <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center gap-2">
        <Hash className="w-5 h-5 text-indigo-400" />
        <span className="font-semibold text-white">thông-báo-workspace</span>
        <span className="text-xs text-slate-500 border-l border-slate-700 pl-2 ml-1">
          Kênh trò chuyện chung của toàn bộ thành viên workspace
        </span>
      </div>

      {/* Danh sách tin nhắn */}
      <div className="flex-1 p-5 space-y-4 overflow-y-auto">
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-1">
          <h3 className="text-indigo-300 font-semibold text-base flex items-center gap-2">
            <Hash className="w-5 h-5" /> Chào mừng bạn đến với kênh chat Workspace!
          </h3>
          <p className="text-xs text-slate-400">
            Đây là không gian trao đổi thông tin chính thức của toàn bộ thành viên trong
            workspace này.
          </p>
        </div>

        {isMessagesLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : messagesData?.items && messagesData.items.length > 0 ? (
          <div className="space-y-4 pt-2">
            {messagesData.items.map((msg: ChatMessage) => {
              const isMe = msg.sender?.id === userId;
              const timeString = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              // Tìm thông tin role của người gửi trong workspace members
              const senderMember = workspaceMembers.find(
                (m) => m.user?.id === msg.sender?.id,
              );
              const isOwner = senderMember?.role === "OWNER";
              const isLeader = senderMember?.role === WorkspaceRole.LEADER_WORKSPACE;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isMe ? "justify-end" : "justify-start"
                  }`}>
                  {/* Nếu không phải là mình thì hiển thị Avatar bên trái */}
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

                  {/* Khối chứa tên và nội dung tin nhắn */}
                  <div
                    className={`space-y-1 max-w-xl flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    }`}>
                    {/* Dòng Header: Tên, Badge, Thời gian */}
                    <div className="flex items-center gap-2">
                      {isMe ? (
                        <>
                          <span className="text-[10px] text-slate-500">{timeString}</span>
                          <span className="px-1.5 py-0.2 bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 text-[10px] font-semibold rounded-md">
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
                            <span className="text-[9px] font-medium px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" /> Owner
                            </span>
                          )}
                          {isLeader && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />{" "}
                              Leader
                            </span>
                          )}

                          <span className="text-[10px] text-slate-500">{timeString}</span>
                        </>
                      )}
                    </div>

                    {/* Bong bóng nội dung tin nhắn */}
                    <p
                      className={`text-sm p-3 rounded-2xl border break-words inline-block ${
                        isMe
                          ? "bg-indigo-600 text-white rounded-tr-none border-indigo-500/50 shadow-md text-right"
                          : "bg-slate-800/60 text-slate-300 rounded-tl-none border-slate-700/50 text-left"
                      }`}>
                      {msg.content}
                    </p>

                    {/* Tệp đính kèm nếu có */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div
                        className={`flex flex-wrap gap-2 mt-2 ${
                          isMe ? "justify-end" : "justify-start"
                        }`}>
                        {msg.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-indigo-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 hover:underline">
                            📎 {att.name || "Tệp đính kèm"}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Nếu là mình thì hiển thị Avatar ở bên phải */}
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
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            Chưa có tin nhắn nào trong workspace này. Hãy bắt đầu trò chuyện!
          </div>
        )}
      </div>

      {/* Khung nhập tin nhắn */}
      <form
        onSubmit={handleSendChat}
        className="p-4 border-t border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 focus-within:border-indigo-500 transition-all">
          <button
            type="button"
            className="text-slate-400 hover:text-slate-200 cursor-pointer">
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
            disabled={isSending || !chatMessage.trim()}
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
