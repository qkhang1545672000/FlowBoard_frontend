"use client";
import { useAuthStore } from "@/store/useAuthStore";

const GetMe = () => {
  const user = useAuthStore((state) => state.user);

  console.log("Check user Zustand:", user);

  if (!user) {
    return <div>Đang tải thông tin hoặc Chưa đăng nhập...</div>;
  }

  return (
    <div>
      GetMe {user.name} ({user.role})
    </div>
  );
};

export default GetMe;
