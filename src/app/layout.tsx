import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import { Toaster } from "sonner";
import { PresenceProvider } from "@/components/home/PresenceProvider"; // 👉 Import component vừa tạo

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: {
    default: "MtikTech",
    template: "%s | MtikTech - Trang thương mại điện tử",
  },
  description: "Mua sắm trực tuyến nhanh chóng và an toàn",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {/* 👉 Đặt PresenceProvider ở đây để chạy ngầm toàn hệ thống */}
          <PresenceProvider />

          {children}

          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
