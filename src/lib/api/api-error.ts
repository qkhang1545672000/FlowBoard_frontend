import { isAxiosError, isCancel } from "axios";
import { toast } from "sonner";

/**
 * Định nghĩa kiểu dữ liệu cho phần thân (body) của lỗi trả về từ API.
 * Thường chứa thông báo lỗi dạng chuỗi đơn hoặc một mảng các chuỗi lỗi (ví dụ lỗi validation từ NestJS).
 */
type ApiErrorBody = {
  message?: string | string[];
};

/**
 * Hàm trích xuất thông điệp lỗi (message) từ đối tượng lỗi bất kỳ (thường là AxiosError hoặc Error thông thường).
 * Mục đích: Lấy ra câu thông báo lỗi thân thiện để hiển thị cho người dùng.
 *
 * @param error - Đối tượng lỗi bắt được trong khối catch
 * @param fallback - Câu thông báo mặc định nếu không trích xuất được message từ API
 * @returns Chuỗi thông báo lỗi
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  // Kiểm tra xem lỗi có phải do Axios trả về hay không
  if (isAxiosError<ApiErrorBody>(error)) {
    const message = error.response?.data?.message;

    // Nếu message là một mảng (ví dụ mảng lỗi validation), lấy phần tử đầu tiên
    if (Array.isArray(message) && message.length > 0) return message[0];

    // Nếu message là chuỗi thông thường, trả về chuỗi đó
    if (typeof message === "string" && message) return message;

    // Nếu không có message nào phù hợp, trả về thông báo dự phòng (fallback)
    return fallback;
  }

  // Nếu là lỗi JavaScript thông thường (ví dụ Error object)
  if (error instanceof Error && error.message) return error.message;

  // Trường hợp còn lại trả về fallback
  return fallback;
}

/**
 * Hàm kiểm tra xem một lỗi có nên được xử lý tự động ở mức độ toàn cục hay không.
 * Mục đích: Bỏ qua các lỗi không cần hiển thị thông báo toast phiền phức (như request bị hủy hoặc lỗi mất mạng/403 đã có cơ chế khác lo).
 *
 * @param error - Đối tượng lỗi cần kiểm tra
 * @returns true nếu nên bỏ qua, ngược lại là false
 */
function isHandledGlobally(error: unknown): boolean {
  // Nếu request bị hủy (ví dụ do component unmount hoặc dùng AbortController) -> Bỏ qua
  if (isCancel(error)) return true;

  // Nếu không phải lỗi Axios -> Không xử lý toàn cục
  if (!isAxiosError(error)) return false;

  // Nếu không có response từ server (mất mạng/sập server) hoặc lỗi 403 (Forbidden) -> Co như đã xử lý toàn cục
  return !error.response || error.response.status === 403;
}

/**
 * Hàm hiển thị thông báo lỗi API dưới dạng Toast notification (sử dụng thư viện sonner).
 * Mục đích: Tự động bắt lỗi và bắn thông báo lên màn hình cho người dùng thấy.
 *
 * @param error - Đối tượng lỗi bắt được từ API
 * @param fallback - Câu thông báo mặc định nếu API không trả về lỗi cụ thể
 */
export function toastApiError(error: unknown, fallback: string): void {
  // Nếu lỗi thuộc diện xử lý toàn cục thì dừng lại, không bắn toast trùng lặp
  if (isHandledGlobally(error)) return;

  // Hiển thị toast lỗi với nội dung lấy từ hàm getApiErrorMessage
  toast.error(getApiErrorMessage(error, fallback));
}

/**
 * Hàm bậc cao (Higher-Order Function) tạo ra một callback xử lý lỗi cho các mutation (TanStack Query / React Query).
 * Mục đích: Giúp viết gọn code ở phần `onError` trong các hook gọi mutation API.
 *
 * @param fallback - Câu thông báo lỗi mặc định khi thất bại
 * @returns Một hàm nhận vào error để gọi trực tiếp `toastApiError`
 */
export function mutationErrorToast(fallback: string) {
  return (error: unknown) => toastApiError(error, fallback);
}
