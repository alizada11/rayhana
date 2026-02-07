import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api";

export type UserRole = "admin" | "guest";

export const useUserRole = () => {
  return useQuery<{ role: UserRole }>({
    queryKey: ["me"],
    queryFn: getMe,
  });
};
