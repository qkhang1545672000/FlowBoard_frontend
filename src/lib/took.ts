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
