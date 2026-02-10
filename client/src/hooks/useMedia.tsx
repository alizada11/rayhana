import {
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { deleteMedia, getMedia, uploadMedia, type MediaAsset } from "@/lib/api";

export const useMedia = () => {
  return useInfiniteQuery<{ items: MediaAsset[]; nextCursor: string | null }>({
    queryKey: ["media"],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      getMedia({ cursor: (pageParam as string | null) ?? null, limit: 12 }),
    getNextPageParam: last => last.nextCursor,
  });
};

export const useUploadMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
};
