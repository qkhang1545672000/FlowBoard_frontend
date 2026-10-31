"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingModalProps {
  isOpen: boolean;
  message?: string; // Thông báo hiển thị dưới spinner
  blurBackground?: boolean; // Tùy chọn làm mờ nền mạnh hơn
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  message = "Đang xử lý dữ liệu...",
  blurBackground = true,
}) => {
  if (!isOpen) return null;

  return (
    // OVERLAY CỐ ĐỊNH, CHẾT TOÀN MÀN HÌNH (Z-[1000] để chắc chắn đè lên sidebar/header)
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-opacity duration-300 animate-in fade-in ${
        blurBackground ? "bg-black/60 backdrop-blur-sm" : "bg-black/40"
      }`}>
      {/* KHUNG MODAL NHỎ GỌN, TOÁT LÊN VẺ SANG TRỌNG CỦA CÔNG NGHỆ (Màu đen bóng) */}
      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center group transition-all duration-300 transform scale-100 min-w-[200px] w-auto max-w-sm">
        {/* HIỆU ỨNG ÁNH SÁNG NGẦM (Glow effect) TẠO ĐIỂM NHẤN */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-80 group-hover:opacity-100 transition duration-1000"></div>

        {/* NỘI DUNG CHÍNH (RELATIVE ĐỂ NẰM TRÊN GLOW) */}
        <div className="relative flex flex-col items-center gap-4">
          {/* SPINNER QUAY MƯỢT MÀ VỚI MÀU INDIGO VÀ TÍM Gradient */}
          <div className="relative w-10 h-10">
            {/* Lớp spinner nhạt phía sau tạo độ sâu */}
            <Loader2 className="absolute inset-0 w-full h-full text-indigo-500/20 animate-spin" />
            {/* Lớp spinner chính đậm nét */}
            <Loader2
              className="absolute inset-0 w-full h-full text-indigo-400 animate-spin"
              style={{ animationDuration: "0.8s" }}
            />
          </div>

          {/* THÔNG BÁO CHỮ MÀU SLATE NHẸ NHÀNG */}
          <p className="text-xs font-medium text-slate-300 tracking-wide font-inter">
            {message}
          </p>

          {/* Thanh loading bar giả lập ở dưới nếu thích sự chi tiết */}
          {/* <div className="w-24 h-0.5 bg-slate-700/50 rounded-full overflow-hidden mt-1 relative">
                <div className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full animate-loading-bar-shimmy w-1/3"></div>
            </div> */}
        </div>
      </div>
    </div>
  );
};
