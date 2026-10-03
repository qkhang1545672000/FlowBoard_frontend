import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. DANH SÁCH ROUTE BẮT BỘC ĐĂNG NHẬP
const PROTECTED_ROUTES = [
  "/",
  "/home",
  "/user",
  "/boards",
  "/w/",
  "/translation",
  "/datacache/api",
];

// 2. DANH SÁCH ROUTE AUTH CÔNG KHAI
const AUTH_ROUTES = ["/auth/signin", "/auth/signup"];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lấy Cookie session token của Better Auth
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  // Kiểm tra xem route hiện tại có phải là AUTH ROUTE không
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route),
  );

  // NẾU LÀ TRANG AUTH (/auth/signin, /auth/signup)
  if (isAuthRoute) {
    // Nếu ĐÃ đăng nhập -> Đẩy sang /workspace hoặc /home
    if (sessionToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Nếu CHƯA đăng nhập -> Cho phép vào trang /auth/signin bình thường (Không redirect)
    return NextResponse.next();
  }

  // Kiểm tra xem route hiện tại có phải là PROTECTED ROUTE không
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname.startsWith(route);
  });

  // NẾU LÀ PROTECTED ROUTE MÀ CHƯA ĐĂNG NHẬP -> Mới chuyển hướng sang /auth/signin
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL("/auth/signin", request.url);
    loginUrl.searchParams.set("callbackUrl", encodeURIComponent(pathname));
    return NextResponse.redirect(loginUrl);
  }

  // Xử lý API Proxy rewrite sang NestJS
  if (isProtectedRoute && sessionToken && pathname.startsWith("/datacache/api")) {
    const targetPath = pathname.replace("/datacache/api", "");
    const targetUrl = `${BACKEND_URL}${targetPath}${request.nextUrl.search}`;
    return NextResponse.rewrite(new URL(targetUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
