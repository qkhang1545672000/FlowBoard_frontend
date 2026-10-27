/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { MoreHorizontal, Users, CheckSquare, Edit3, History, Trash2 } from "lucide-react";

import { BoardOverview } from "@/types/board";
import { useBoardStore } from "@/store/useBoardStore";
import { BoardHistoryModal } from "./BoardHistoryModal";
import { DeleteConfirmModal } from "../ui/DeleteConfirmModal";
import { useDeleteBoard } from "@/hooks/useBoard";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { CreateBoardModal } from "./create-board-modal"; // Import modal tạo/sửa board

interface BoardCardProps {
  board: BoardOverview;
  workspaceMembers?: any[]; // Danh sách thành viên workspace để truyền vào modal chỉnh sửa
}

export function BoardCard({ board, workspaceMembers = [] }: BoardCardProps) {
  const setActiveBoard = useBoardStore((state) => state.setActiveBoard);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspaceId) ?? "";
  const { mutate: deleteBoard } = useDeleteBoard(activeWorkspace);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State quản lý modal chỉnh sửa board

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEditBoard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsEditModalOpen(true); // Mở modal chỉnh sửa board
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsDeleteConfirmOpen(true);
  };

  const handleOpenHistory = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsHistoryModalOpen(true);
  };

  return (
    <>
      <Link
        href={`/b/${board.slug}`}
        onClick={() => setActiveBoard({ id: board.id, slug: board.slug })}>
        <div className="group bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4 transition-all duration-200 hover:shadow-xl hover:border-slate-600 cursor-pointer flex flex-col justify-between h-44 backdrop-blur-sm relative">
          {/* Header: Title & Actions */}
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors pr-6 line-clamp-1">
                {board.title}
              </h3>

              {/* Nút 3 chấm & Sub Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMenuOpen((prev) => !prev);
                  }}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-700/50 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {/* Submenu Dropdown */}
                {isMenuOpen && (
                  <div className="absolute right-0 top-7 w-36 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50 text-xs text-slate-300 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={handleDeleteClick}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left rounded-md">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      Xóa
                    </button>
                    <button
                      onClick={handleEditBoard}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-700/60 hover:text-white transition-colors text-left">
                      <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={handleOpenHistory}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-700/60 hover:text-white transition-colors text-left">
                      <History className="w-3.5 h-3.5 text-emerald-400" />
                      Lịch sử
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Kanban Visual Mini-Preview Mockup */}
            <div className="grid grid-cols-4 gap-1 my-2 opacity-50 group-hover:opacity-90 transition-opacity">
              <div className="h-7 bg-slate-700/40 rounded-md border border-slate-600/20 p-1">
                <div className="h-1 bg-indigo-500/80 rounded w-full mb-1" />
                <div className="h-1 bg-slate-600 rounded w-3/4" />
              </div>
              <div className="h-7 bg-slate-700/40 rounded-md border border-slate-600/20 p-1">
                <div className="h-1 bg-emerald-500/80 rounded w-full mb-1" />
              </div>
              <div className="h-7 bg-slate-700/40 rounded-md border border-slate-600/20 p-1">
                <div className="h-1 bg-amber-500/80 rounded w-full mb-1" />
                <div className="h-1 bg-slate-600 rounded w-1/2" />
              </div>
              <div className="h-7 bg-slate-700/40 rounded-md border border-slate-600/20 p-1">
                <div className="h-1 bg-purple-500/80 rounded w-full mb-1" />
              </div>
            </div>
          </div>

          {/* Footer: Metadata */}
          <div className="border-t border-slate-700/30 pt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-indigo-400" />
                {board.tasksCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-400" />
                {board.membersCount || 1}
              </span>
            </div>

            <span className="truncate max-w-[110px]">
              {board.updatedAt
                ? formatDistanceToNow(new Date(board.updatedAt), {
                    addSuffix: true,
                    locale: vi,
                  })
                : "gần đây"}
            </span>
          </div>
        </div>
      </Link>

      {/* Modal Lịch sử hoạt động */}
      <BoardHistoryModal
        boardId={board.id}
        boardTitle={board.title}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      {/* Modal Xác nhận xóa Bảng */}
      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          deleteBoard(board.id);
        }}
        title="Xác nhận xóa bảng"
        message={`Bạn thực sự muốn xóa bảng "${board.title}"?`}
      />

      {/* Modal Chỉnh sửa Board (Tái sử dụng CreateBoardModal) */}
      <CreateBoardModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        workspaceMembers={workspaceMembers}
        boardToEdit={board}
      />
    </>
  );
}
