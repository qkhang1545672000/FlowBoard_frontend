"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Lock,
  ExternalLink,
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  Camera,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUpdateProfile } from "@/hooks/user-auth"; // 👉 Import hook vừa tạo ở Bước 2

interface UserData {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
  phone: string | null;
  birthday: Date | null;
  gender: string | null;
  provider?: "google" | "credentials";
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData;
}

export const EditProfileModal = ({ isOpen, onClose, user }: EditProfileModalProps) => {
  const currentUser = useAuthStore((state) => state.user);

  // 👉 Gọi mutation hook
  const updateProfileMutation = useUpdateProfile();

  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [birthday, setBirthday] = useState(
    currentUser?.birthday
      ? new Date(currentUser.birthday).toISOString().split("T")[0]
      : "",
  );
  const [gender, setGender] = useState(currentUser?.gender || "");
  const [imagePreview, setImagePreview] = useState<string | null>(
    currentUser?.image ?? null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Đồng bộ lại state khi user prop hoặc currentUser thay đổi
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setPhone(currentUser.phone || "");
      setBirthday(
        currentUser.birthday
          ? new Date(currentUser.birthday).toISOString().split("T")[0]
          : "",
      );
      setGender(currentUser.gender || "");
      setImagePreview(currentUser.image || null);
      setImageFile(null);
    }
  }, [currentUser]);

  if (!isOpen || typeof window === "undefined") return null;

  const isGoogleAccount = user.provider === "google" || user.email.includes("@gmail.com");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 👉 Gọi mutation để gửi dữ liệu lên server
    updateProfileMutation.mutate(
      {
        name,
        phone,
        birthday: birthday ? new Date(birthday) : null,
        gender,
        imageFile,
      },
      {
        onSuccess: () => {
          onClose(); // Đóng modal khi thành công
        },
      },
    );
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">Cập nhật thông tin cá nhân</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800/80 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <img
                  src={imagePreview || "https://via.placeholder.com/150"}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-white">{name || user.name}</h3>
                <p className="text-xs text-slate-400">{user.email}</p>
                <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold rounded-full border border-indigo-500/20 uppercase">
                  {user.role}
                </span>
              </div>
            </div>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition shadow-sm">
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>Đổi ảnh đại diện</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Tên hiển thị
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> Email hệ thống
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Số điện thoại
              </label>
              <input
                type="text"
                placeholder="Chưa cập nhật"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Ngày sinh
              </label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" /> Giới tính
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-200">
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          {isGoogleAccount && (
            <div className="p-4 bg-amber-950/30 border border-amber-500/20 rounded-xl flex gap-3 items-start">
              <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-amber-300">
                  Tài khoản đăng nhập qua Google
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Mật khẩu và thông tin bảo mật chính được quản lý trực tiếp bởi
                  Google[cite: 5].
                </p>
                <a
                  href="https://myaccount.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-400 hover:underline pt-1 font-medium">
                  Quản lý tài khoản Google <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition">
              Hủy
            </button>
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-600/20">
              {updateProfileMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
