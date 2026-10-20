"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  MessageSquare,
  Layout,
  ChevronRight,
  ArrowLeft,
  Activity,
  Send,
} from "lucide-react";

interface ActionItem {
  id: string;
  title: string;
  time: string;
  unread: boolean;
  boardId: string;
  boardName: string;
}

interface Message {
  id: string;
  sender: string;
  avatar?: string; // Link ảnh avatar (nếu có)
  text: string;
  time: string;
}

interface TaskChatBubble {
  taskId: string;
  taskTitle: string;
  boardId: string;
  boardName: string;
  lastSender: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: Message[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  coords: { top: number; right: number; isAbove: boolean };
  workspaceName: string;
}

export default function WorkspaceNotificationPopover({
  isOpen,
  onClose,
  coords,
  workspaceName,
}: Props) {
  const [mainTab, setMainTab] = useState<"all" | "unread">("all");
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [boardDetailTab, setBoardDetailTab] = useState<"all" | "chat" | "action">("all");

  const [activeChatBubble, setActiveChatBubble] = useState<TaskChatBubble | null>(null);
  const [replyText, setReplyText] = useState("");

  const [actions, setActions] = useState<ActionItem[]>([
    {
      id: "1",
      title: "Alex vừa chuyển task 'Setup Database' sang cột Doing",
      time: "5 phút trước",
      unread: true,
      boardId: "board-1",
      boardName: "Kanban Frontend Sprint 1",
    },
    {
      id: "3",
      title: "Minh vừa kéo task 'Làm UI Notification' sang Done",
      time: "30 phút trước",
      unread: false,
      boardId: "board-1",
      boardName: "Kanban Frontend Sprint 1",
    },
    {
      id: "5",
      title: "Hùng vừa cập nhật deadline cho task 'Deploy Render'",
      time: "2 giờ trước",
      unread: false,
      boardId: "board-2",
      boardName: "Backend Core Service",
    },
  ]);

  const [chatBubbles, setChatBubbles] = useState<TaskChatBubble[]>([
    {
      taskId: "task-101",
      taskTitle: "Task: Review PR Frontend",
      boardId: "board-1",
      boardName: "Kanban Frontend Sprint 1",
      lastSender: "Alex Rivera",
      lastMessage: "Mọi người review PR trong task này nhé",
      time: "15 phút trước",
      unread: true,
      messages: [
        {
          id: "m1",
          sender: "Alex Rivera",
          text: "Chào mọi người, mình đã đẩy code lên.",
          time: "20 phút trước",
        },
        {
          id: "m2",
          sender: "Alex Rivera",
          text: "Mọi người review PR trong task này nhé",
          time: "15 phút trước",
        },
      ],
    },
    {
      taskId: "task-202",
      taskTitle: "Task: Fix lỗi API Auth 500",
      boardId: "board-2",
      boardName: "Backend Core Service",
      lastSender: "Linh",
      lastMessage: "API Auth bị lỗi 500 rồi mọi người ơi",
      time: "1 giờ trước",
      unread: true,
      messages: [
        {
          id: "m3",
          sender: "Linh",
          text: "API Auth bị lỗi 500 rồi mọi người ơi",
          time: "1 giờ trước",
        },
      ],
    },
  ]);

  if (!isOpen) return null;

  const handleMarkAllAsRead = () => {
    setActions((prev) => prev.map((a) => ({ ...a, unread: false })));
    setChatBubbles((prev) => prev.map((c) => ({ ...c, unread: false })));
  };

  const totalUnreadCount =
    actions.filter((a) => a.unread).length + chatBubbles.filter((c) => c.unread).length;

  const uniqueBoards = Array.from(
    new Set([...actions.map((a) => a.boardId), ...chatBubbles.map((c) => c.boardId)]),
  ).map((boardId) => {
    const foundAct = actions.find((a) => a.boardId === boardId);
    const foundChat = chatBubbles.find((c) => c.boardId === boardId);
    const boardName = foundAct?.boardName || foundChat?.boardName || "Board";

    const boardActions = actions.filter((a) => a.boardId === boardId);
    const boardChats = chatBubbles.filter((c) => c.boardId === boardId);
    const unreadCount =
      boardActions.filter((a) => a.unread).length +
      boardChats.filter((c) => c.unread).length;

    return {
      boardId,
      boardName,
      unreadCount,
      totalCount: boardActions.length + boardChats.length,
    };
  });

  const handleSendMessage = () => {
    if (!replyText.trim() || !activeChatBubble) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "Bạn",
      text: replyText,
      time: "Vừa xong",
    };

    setChatBubbles((prev) =>
      prev.map((cb) =>
        cb.taskId === activeChatBubble.taskId
          ? {
              ...cb,
              messages: [...cb.messages, newMessage],
              lastMessage: replyText,
              lastSender: "Bạn",
              unread: false,
            }
          : cb,
      ),
    );

    setActiveChatBubble((prev) =>
      prev ? { ...prev, messages: [...prev.messages, newMessage], unread: false } : null,
    );
    setReplyText("");
  };

  const currentBoardActions = actions.filter((a) => a.boardId === selectedBoardId);
  const currentBoardChats = chatBubbles.filter((c) => c.boardId === selectedBoardId);
  const currentBoardName = uniqueBoards.find(
    (b) => b.boardId === selectedBoardId,
  )?.boardName;

  // Hàm tạo chữ cái đầu cho avatar chữ nếu không có ảnh
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[998]" onClick={onClose} />

      <div
        style={{
          position: "fixed",
          ...(coords.isAbove
            ? { bottom: window.innerHeight - coords.top + 8 }
            : { top: coords.top }),
          right: coords.right,
        }}
        className="w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/60 z-[999] p-3 text-xs space-y-3 animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          {activeChatBubble ? (
            <button
              type="button"
              onClick={() => setActiveChatBubble(null)}
              className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium transition -ml-1 p-1 rounded-lg hover:bg-slate-800/60">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Board</span>
            </button>
          ) : selectedBoardId ? (
            <button
              type="button"
              onClick={() => {
                setSelectedBoardId(null);
                setBoardDetailTab("all");
              }}
              className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium transition -ml-1 p-1 rounded-lg hover:bg-slate-800/60">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại danh sách</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">Thông báo Workspace</span>
              {totalUnreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-full">
                  {totalUnreadCount} mới
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* --- KHUNG CHAT CHI TIẾT (CÓ AVATAR GIỐNG MESSENGER) --- */}
        {activeChatBubble ? (
          <div className="space-y-2.5">
            <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-indigo-400 font-semibold block">
                  {activeChatBubble.boardName}
                </span>
                <h4 className="font-medium text-slate-200 text-[11px]">
                  {activeChatBubble.taskTitle}
                </h4>
              </div>
              <span
                className="w-2 h-2 bg-emerald-500 rounded-full shrink-0"
                title="Đang mở chat"
              />
            </div>

            {/* Danh sách tin nhắn kèm Avatar */}
            <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1 text-[11px]">
              {activeChatBubble.messages.map((msg) => {
                const isMe = msg.sender === "Bạn";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Avatar tượng trưng */}
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0 shadow-sm">
                      {getInitials(msg.sender)}
                    </div>

                    {/* Nội dung tin nhắn */}
                    <div
                      className={`max-w-[75%] p-2 rounded-xl space-y-0.5 ${
                        isMe
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none"
                      }`}>
                      <div className="flex items-center justify-between gap-3 text-[9px] opacity-80">
                        <span className="font-semibold">{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ô nhập tin nhắn */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-[11px]"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : !selectedBoardId ? (
          /* --- MÀN HÌNH TỔNG QUAN --- */
          <>
            <div className="flex bg-slate-800/60 p-1 rounded-xl gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setMainTab("all")}
                className={`flex-1 py-1 rounded-lg font-medium transition ${
                  mainTab === "all"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400"
                }`}>
                Tất cả (Theo Board)
              </button>
              <button
                type="button"
                onClick={() => setMainTab("unread")}
                className={`flex-1 py-1 rounded-lg font-medium transition flex items-center justify-center gap-1 ${
                  mainTab === "unread"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400"
                }`}>
                Chưa đọc
                {totalUnreadCount > 0 && (
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                )}
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {mainTab === "all" ? (
                uniqueBoards.map((board) => (
                  <div
                    key={board.boardId}
                    onClick={() => setSelectedBoardId(board.boardId)}
                    className="w-full p-2.5 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl transition flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-500/20 transition">
                        <Layout className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-200 text-[11px]">
                          {board.boardName}
                        </h4>
                        <span className="text-[10px] text-slate-500">
                          {board.totalCount} thông báo
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {board.unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-indigo-500 text-white text-[9px] font-bold rounded-full">
                          {board.unreadCount} mới
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  {chatBubbles
                    .filter((c) => c.unread)
                    .map((chat) => (
                      <div
                        key={chat.taskId}
                        onClick={() => {
                          setActiveChatBubble(chat);
                          setChatBubbles((prev) =>
                            prev.map((c) =>
                              c.taskId === chat.taskId ? { ...c, unread: false } : c,
                            ),
                          );
                        }}
                        className="p-2.5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl cursor-pointer flex items-center justify-between">
                        <div className="space-y-0.5 flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                            <span className="font-medium text-[11px] text-slate-200">
                              {chat.taskTitle}
                            </span>
                            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            {chat.lastMessage}
                          </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    ))}
                  {actions
                    .filter((a) => a.unread)
                    .map((act) => (
                      <div
                        key={act.id}
                        className="p-2.5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl flex items-start gap-2 text-slate-200">
                        <Activity className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-[11px] font-medium leading-tight">
                            {act.title}
                          </p>
                          <span className="text-[9px] text-slate-500">{act.time}</span>
                        </div>
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0" />
                      </div>
                    ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* --- CHI TIẾT BOARD --- */
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-semibold text-indigo-300 truncate max-w-[200px]">
                {currentBoardName}
              </h3>
            </div>

            <div className="flex bg-slate-800/80 p-0.5 rounded-lg gap-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => setBoardDetailTab("all")}
                className={`flex-1 py-1 rounded-md transition ${
                  boardDetailTab === "all"
                    ? "bg-indigo-600 text-white font-medium"
                    : "text-slate-400"
                }`}>
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setBoardDetailTab("chat")}
                className={`flex-1 py-1 rounded-md transition flex items-center justify-center gap-1 ${
                  boardDetailTab === "chat"
                    ? "bg-indigo-600 text-white font-medium"
                    : "text-slate-400"
                }`}>
                <MessageSquare className="w-3 h-3" /> Chat Task
              </button>
              <button
                type="button"
                onClick={() => setBoardDetailTab("action")}
                className={`flex-1 py-1 rounded-md transition flex items-center justify-center gap-1 ${
                  boardDetailTab === "action"
                    ? "bg-indigo-600 text-white font-medium"
                    : "text-slate-400"
                }`}>
                <Activity className="w-3 h-3" /> Hành động
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 pt-1">
              {(boardDetailTab === "all" || boardDetailTab === "chat") &&
                currentBoardChats.map((chat) => (
                  <div
                    key={chat.taskId}
                    onClick={() => {
                      setActiveChatBubble(chat);
                      setChatBubbles((prev) =>
                        prev.map((c) =>
                          c.taskId === chat.taskId ? { ...c, unread: false } : c,
                        ),
                      );
                    }}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-3 ${
                      chat.unread
                        ? "bg-indigo-950/30 border-indigo-500/40 text-slate-200"
                        : "bg-slate-800/30 border-slate-800 text-slate-400"
                    }`}>
                    {/* Avatar hình tròn (có chữ cái đầu tiên của tên người gửi cuối) */}
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {getInitials(chat.lastSender)}
                      </div>
                      {chat.unread && (
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1 space-y-0.5 truncate">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[11px] text-slate-200 truncate">
                          {chat.taskTitle}
                        </span>
                        <span className="text-[9px] text-slate-500">{chat.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        <strong className="text-slate-300">{chat.lastSender}:</strong>{" "}
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                ))}

              {(boardDetailTab === "all" || boardDetailTab === "action") &&
                currentBoardActions.map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 bg-slate-800/30 border border-slate-800/60 rounded-xl text-[11px] text-slate-400 flex items-start gap-2.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <p className="leading-relaxed font-medium text-slate-300">
                        {act.title}
                      </p>
                      <span className="text-[9px] text-slate-500">{act.time}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition">
            Đánh dấu tất cả là đã đọc
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
