"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Mail, Loader2, UserPlus } from "lucide-react";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
  onInvite: (email: string) => Promise<void> | void;
}

const InviteMemberModal = ({
  isOpen,
  onClose,
  workspaceName,
  onInvite,
}: InviteMemberModalProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await onInvite(email.trim());
      setEmail("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra khi gửi lời mời");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Mời thành viên</h3>
              <p className="text-xs text-slate-400">{workspaceName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form nhập email */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                autoFocus
                disabled={isSubmitting}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="nhap.email@example.com"
                className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-indigo-500 focus:outline-none rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-all"
              />
            </div>
            {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50">
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Gửi lời mời
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default InviteMemberModal;
