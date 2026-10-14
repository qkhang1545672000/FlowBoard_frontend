"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

// Component nội bộ thực hiện việc gọi hook
function PathnameWatcher({
  children,
}: {
  children: (pathname: string) => React.ReactNode;
}) {
  const pathname = usePathname();
  return <>{children(pathname)}</>;
}

// Custom Wrapper Component dùng để tái sử dụng ở bất cứ đâu bạn muốn dùng pathname
export function WithPathname({
  children,
}: {
  children: (pathname: string) => React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <PathnameWatcher>{children}</PathnameWatcher>
    </Suspense>
  );
}
