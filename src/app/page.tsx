import HeaderIndex from "@/components/home/headerHome";
import ContentIndex from "@/components/home/workspaceHome";
import NotificationIndex from "@/components/home/notificationHome";
// Dữ liệu giả lập test

export default function Home() {
  // Dữ liệu mẫu danh sách Workspaces

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* KHU VỰC NỘI DUNG CHÍNH (Glassmorphism Main Dashboard) */}
      <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
        {/* 1. Header Tìm kiếm & Profile */}
        <HeaderIndex />

        {/* 2. Phần MY WORKSPACES */}
        <ContentIndex />

        {/* 3. Phần MY NOTIFICATIONS (Tasks Sắp Quá Hạn) */}
        <NotificationIndex />
      </div>

      {/* RIGHT SIDEBAR (Cột menu bên phải giống ảnh) */}
    </div>
  );
}
