"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Folder, MoreHorizontal, Pencil, Trash2, X, Loader2 } from "lucide-react";
import GroupChatAvatar from "../ui/GroupChatAvatar";
import { WorkspaceResponse } from "@/types/workSpace";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { createPortal } from "react-dom";
import { useDeleteWorkspace } from "@/hooks/useWorkSpace";
import InviteMemberModal from "./InviteMemberModal"; // 👈 Import Modal mới

interface Props {
  ws: WorkspaceResponse;
  onDelete?: (id: string) => Promise<void> | void;
  onRename?: (id: string) => void;
  onInviteMember?: (workspaceId: string, email: string) => Promise<void> | void;
}

const WorkspaceCard = ({ ws, onDelete, onRename, onInviteMember }: Props) => {
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);
  const { mutateAsync: deleteWorkspaceMutation, isPending: isDeleteAPI } =
    useDeleteWorkspace();

  // States quản lý UI Popover & Modals
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false); // 👈 State mở Modal Invite
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Tránh lỗi Mismatch Hydration trong Next.js khi dùng Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Xử lý nút xóa
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await deleteWorkspaceMutation(ws.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Lỗi khi xóa workspace:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Xử lý gửi email mời
  const handleInviteConfirm = async (email: string) => {
    if (onInviteMember) {
      await onInviteMember(ws.id, email);
    } else {
      console.log(`Gửi lời mời tham gia workspace ${ws.id} tới: ${email}`);
    }
  };

  return (
    <>
      <div className="relative group">
        <Link
          href={`/w/${ws.slug}`}
          onClick={() => setActiveWorkspace({ id: ws.id, slug: ws.slug })}
          className="bg-slate-900/80 hover:bg-slate-800/90 border border-indigo-500/50 hover:border-indigo-500/60 p-4 rounded-2xl transition-all shadow-lg flex flex-col justify-between space-y-4 backdrop-blur-md block">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/50">
                <Folder className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                  {ws.name}
                </h3>
                <p className="text-[11px] text-slate-400">{ws.boardsCount} boards</p>
              </div>
            </div>

            {/* Nút bấm "..." */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault(); // Tránh kích hoạt Link
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
              className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-slate-800">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-3">
            {/* 🟢 Click vào icon avatar để mở Modal mời thành viên */}
            <div
              onClick={(e) => {
                e.preventDefault(); // Chặn Link chuyển trang
                e.stopPropagation();
                setShowInviteModal(true);
              }}
              className="flex items-center -space-x-1.5 cursor-pointer hover:opacity-80 transition-opacity"
              title="Mời thành viên mới">
              <GroupChatAvatar participants={ws.members} type="sidebar" maxVisible={3} />
            </div>
            <span>2 hours ago</span>
          </div>
        </Link>

        {/* Dropdown Menu (Xóa & Đổi tên) */}
        {showMenu && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
            <div className="absolute right-3 top-10 z-30 w-36 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  if (onRename) onRename(ws.id);
                }}
                className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-700/60 flex items-center gap-2 transition-colors">
                <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                Đổi tên
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  setShowDeleteModal(true);
                }}
                className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                Xóa
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal Mời Thành Viên */}
      {mounted && (
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          workspaceName={ws.name}
          onInvite={handleInviteConfirm}
        />
      )}

      {/* Modal xác nhận Xóa */}
      {showDeleteModal &&
        mounted &&
        createPortal(
          <div
            onClick={() => setShowDeleteModal(false)}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-semibold text-slate-100">Xác nhận xóa</h3>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-slate-300">
                Bạn có muốn xóa workspace{" "}
                <strong className="text-slate-100 font-semibold">{ws.name}</strong> không?
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting || isDeleteAPI}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                  No (Hủy)
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting || isDeleteAPI}
                  className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded-xl flex items-center gap-2 transition-colors">
                  {(isDeleting || isDeleteAPI) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  Yes (Thực hiện)
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default WorkspaceCard;
