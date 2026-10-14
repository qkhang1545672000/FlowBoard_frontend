import { useAuthStore } from "@/store/useAuthStore";

export const useSafeUser = () => {
  const user = useAuthStore((state) => state.user);

  if (user) return user;

  if (typeof window !== "undefined") {
    try {
      const storedUser = localStorage.getItem("auth-storage"); // Thay key này bằng key persist thực tế của bạn
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return parsed?.state?.user || null;
      }
    } catch (e) {
      return null;
    }
  }

  return null;
};
