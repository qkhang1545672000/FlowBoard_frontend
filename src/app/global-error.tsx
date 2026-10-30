"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center space-y-4 p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-xl">
          <h2 className="text-xl font-bold text-red-400">Đã có lỗi hệ thống xảy ra!</h2>
          <p className="text-sm text-slate-400">
            {error?.message || "Lỗi không xác định trong quá trình tải trang."}
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors">
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
