import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export type UserRole = "admin" | "guest";

export const useUserRole = (opts?: { enabled?: boolean }) => {
  const { isSignedIn } = useAuth();

  return useQuery<{ role: UserRole }>({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: (opts?.enabled ?? true) && isSignedIn, // avoid hitting /users/me when not authenticated
  });
};
