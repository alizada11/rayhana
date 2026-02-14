import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteUserAdmin,
  getUsersAdmin,
  updateUserAdmin,
  type AdminUser,
  type UserRole,
} from "@/lib/api";

export const useUsers = ({
  search,
  role,
  limit = 20,
}: {
  search?: string;
  role?: UserRole | "all";
  limit?: number;
}) => {
  return useInfiniteQuery({
    queryKey: ["users", { search: search ?? "", role: role ?? "all", limit }],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      getUsersAdmin({
        search,
        role,
        cursor: pageParam,
        limit,
      }),
    getNextPageParam: lastPage => lastPage.nextCursor,
  });
};

export const useUpdateUserAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Pick<AdminUser, "name" | "email" | "role">>;
    }) => updateUserAdmin({ id, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUserAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUserAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
