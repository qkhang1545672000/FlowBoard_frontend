"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown, User, LogOut } from "lucide-react";
import { useSignOut } from "@/hooks/user-auth";
import { EditProfileModal } from "./EditProfileModal"; // Import modal vừa tạo

interface UserProfileMenuProps {
  children: ReactNode;
  userData?: any; // Nhận thêm dữ liệu user theo schema của bạn
  onLogoutClick?: () => void;
}

export const UserProfileMenu = ({
  children,
  userData = {
    id: "1",
    name: "Alex Rivera",
    email: "alex.rivera@gmail.com",
    emailVerified: true,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop",
    role: "CUSTOMER",
    phone: "0912345678",
    birthday: new Date("1998-05-12"),
    gender: "Nam",
    provider: "google",
  },
}: UserProfileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // State điều khiển modal
  const menuRef = useRef<HTMLDivElement>(null);
  const { mutateAsync: signOut } = useSignOut();

  // Tự động đóng submenu khi click ra vùng bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleOut = async () => {
    await signOut();
  };

  const handleSaveProfile = (updatedData: any) => {
    console.log("Dữ liệu cập nhật:", updatedData);
    // Gọi API cập nhật thông tin user ở đây...
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={menuRef}>
        {/* Vùng bấm để bật/tắt menu chứa children (UserAvatar) */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 pl-3 border-l border-slate-800 cursor-pointer select-none group">
          {children}

          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 ml-1 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-white" : ""
            }`}
          />
        </div>

        {/* Submenu Dropdown */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-[9999] py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsProfileModalOpen(true); // Mở Modal Profile khi bấm vào đây
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Profile</span>
            </button>

            <div className="h-[1px] bg-slate-800 my-1" />

            <button
              onClick={() => {
                setIsOpen(false);
                handleOut();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors">
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>

      {/* RENDER MODAL QUẢN LÝ THÔNG TIN CÁ NHÂN */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={userData}
        onSave={handleSaveProfile}
      />
    </>
  );
};
