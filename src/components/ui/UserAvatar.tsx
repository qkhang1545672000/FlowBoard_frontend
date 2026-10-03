import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface IUserAvatarProps {
  type: "sidebar" | "chat" | "profile" | "min";
  name?: string;
  avatarUrl?: string;
  className?: string; // Tùy chỉnh Avatar container (kích thước, border,...)
  fallbackClassName?: string; // Tùy chỉnh màu nền & style riêng cho Fallback từ bên ngoài
}

const UserAvatar = ({
  type,
  name = "Moji", // Sử dụng default parameter thay vì gán lại biến
  avatarUrl,
  className,
  fallbackClassName,
}: IUserAvatarProps) => {
  return (
    <Avatar
      className={cn(
        type === "sidebar" && "size-12 text-base",
        type === "chat" && "size-8 text-sm",
        type === "profile" && "size-24 text-3xl shadow-md",
        type === "min" && "size-7 text-xs shadow-md", // Đã sửa size-7 đi kèm text-xs cho phù hợp
        className,
      )}>
      <AvatarImage src={avatarUrl} alt={name} />
      <AvatarFallback
        className={cn(
          "font-semibold text-white bg-blue-500", // Màu mặc định nếu không có avatarUrl
          fallbackClassName, // Cho phép ghi đè màu nền từ bên ngoài (VD: "bg-emerald-600", "bg-rose-500")
        )}>
        {name ? name.charAt(0).toUpperCase() : "M"}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
