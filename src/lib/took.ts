export const formatWorkspaceSlug = (str: string): string => {
  return str
    .toLowerCase() // Chuyển thành chữ thường
    .normalize("NFD") // Tách các ký tự dấu ra khỏi chữ cái gốc
    .replace(/[\u0300-\u036f]/g, "") // Xóa các dấu tiếng Việt
    .replace(/đ/g, "d") // Chuyển 'đ' thành 'd'
    .replace(/Đ/g, "d") // Chuyển 'Đ' thành 'd'
    .trim() // Xóa khoảng trắng thừa ở 2 đầu
    .replace(/\s+/g, "_") // Thay thế 1 hoặc nhiều khoảng trắng bằng dấu "_"
    .replace(/[^\w\_]+/g, ""); // Xóa các ký tự đặc biệt còn lại (chỉ giữ lại chữ, số và dấu _)
};

// Ví dụ test:
// formatWorkspaceSlug("đi bơi") => "di_boi"

export function calculateTimeProgress(createdAt?: string, dueDate?: string): number {
  if (!createdAt || !dueDate) return 0; // Nếu thiếu dữ liệu thì tiến độ là 0%

  const start = new Date(createdAt).getTime();
  const end = new Date(dueDate).getTime();
  const now = new Date().getTime();

  // Nếu thời điểm hiện tại đã quá hạn -> 100%
  if (now >= end) return 100;
  // Nếu thời điểm hiện tại trước thời điểm tạo -> 0%
  if (now <= start) return 0;

  const totalDuration = end - start;
  const elapsed = now - start;

  // Tính phần trăm thời gian đã trôi qua
  const percentage = Math.round((elapsed / totalDuration) * 100);

  // Đảm bảo giá trị luôn nằm trong khoảng từ 0 đến 100
  return Math.min(Math.max(percentage, 0), 100);
}

export function getRemainingTime(dueDate?: string): string {
  if (!dueDate) return "";
  const diff = new Date(dueDate).getTime() - new Date().getTime();
  if (diff <= 0) return "Đã quá hạn";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `Còn ${days} ngày`;
  if (hours > 0) return `Còn ${hours} giờ`;
  return "Sắp đến hạn";
}
