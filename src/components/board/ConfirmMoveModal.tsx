"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  targetColumnTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmMoveModal({
  isOpen,
  targetColumnTitle,
  onConfirm,
  onCancel,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-4">
        <div className="flex items-center gap-3 text-amber-400">
          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100">Xác nhận chuyển thẻ</h3>
            <p className="text-xs text-slate-400">Cột này ở trạng thái Khóa 1 Chiều</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Bạn có chắc chắn muốn chuyển thẻ này sang cột{" "}
          <span className="font-semibold text-indigo-400">{targetColumnTitle}</span>?
          <br />
          <span className="text-xs text-rose-400 mt-1 inline-block">
            * Sau khi chuyển vào, bạn sẽ không thể kéo thẻ này ra ngoài được nữa.
          </span>
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors">
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-colors">
            Chuyển thẻ
          </button>
        </div>
      </div>
    </div>
  );
}
