import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  cacheComponents: true,
  reactStrictMode: false,

  // Thêm đoạn rewrites này để proxy mọi request /api/v1 từ Vercel sang Render
};

export default nextConfig;
