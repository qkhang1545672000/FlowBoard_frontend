import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  reactStrictMode: false,

  // 👉 Khai báo nguồn domain ảnh bên ngoài tại đây
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Nếu bạn dùng Cloudinary (khớp với CLOUD_NAME trong .env)
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Nếu dùng ảnh avatar từ Google OAuth
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
