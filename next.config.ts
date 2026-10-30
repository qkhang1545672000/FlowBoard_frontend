import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  cacheComponents: true,
  reactStrictMode: false,

  // Thêm đoạn rewrites này để proxy mọi request /api/v1 từ Vercel sang Render
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://flowboard-5qt4.onrender.com/api/v1/:path*", // Domain Backend trên Render của bạn
      },
    ];
  },
};

export default nextConfig;
