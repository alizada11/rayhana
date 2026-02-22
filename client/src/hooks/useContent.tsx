import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getContentByKey, upsertContent, getAllContent } from "@/lib/api";

export const useContent = (key: string) => {
  return useQuery({
    queryKey: ["content", key],
    queryFn: () => getContentByKey(key),
    enabled: Boolean(key),
    staleTime: 5 * 60 * 1000, // cache for 5 min
    retry: 1, // don't retry forever
    retryDelay: 1000,
  });
};

export const useAllContent = () => {
  return useQuery({
    queryKey: ["content"],
    queryFn: getAllContent,
  });
};

export const useUpsertContent = (key: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => upsertContent(key, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content", key] });
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
  });
};
