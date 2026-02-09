import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveGallerySubmission,
  createGallerySubmission,
  deleteGallerySubmission,
  getAllGallery,
  getApprovedGallery,
  getMyGallery,
  getGalleryLikes,
  rejectGallerySubmission,
  toggleGalleryLike,
  deleteMyGallerySubmission,
  type GalleryLike,
} from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";

export type GalleryStatus = "pending" | "approved" | "rejected";

export interface GallerySubmission {
  id: string;
  imageUrl: string;
  dishName: string;
  description?: string | null;
  status: GalleryStatus;
  likesCount?: number;
  viewerHasLiked?: boolean;
  createdAt: string;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
}

export const useApprovedGallery = () => {
  return useQuery<GallerySubmission[]>({
    queryKey: ["gallery", "approved"],
    queryFn: getApprovedGallery,
  });
};

export const useAllGallery = () => {
  return useQuery<GallerySubmission[]>({
    queryKey: ["gallery", "admin"],
    queryFn: getAllGallery,
  });
};

export const useMyGallery = () => {
  return useQuery<GallerySubmission[]>({
    queryKey: ["gallery", "my"],
    queryFn: getMyGallery,
  });
};

export const useCreateGallerySubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGallerySubmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery", "approved"] });
      queryClient.invalidateQueries({ queryKey: ["gallery", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["gallery", "my"] });
    },
  });
};

export const useApproveGallerySubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveGallerySubmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery", "approved"] });
      queryClient.invalidateQueries({ queryKey: ["gallery", "admin"] });
    },
  });
};

export const useRejectGallerySubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectGallerySubmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery", "approved"] });
      queryClient.invalidateQueries({ queryKey: ["gallery", "admin"] });
    },
  });
};

export const useDeleteGallerySubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGallerySubmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery", "approved"] });
      queryClient.invalidateQueries({ queryKey: ["gallery", "admin"] });
    },
  });
};

export const useToggleGalleryLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleGalleryLike,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["gallery", "approved"] });
      const prev = queryClient.getQueryData<GallerySubmission[]>([
        "gallery",
        "approved",
      ]);
      if (prev) {
        queryClient.setQueryData<GallerySubmission[]>(
          ["gallery", "approved"],
          prev.map(item => {
            if (item.id !== id) return item;
            const liked = !item.viewerHasLiked;
            const count = (item.likesCount ?? 0) + (liked ? 1 : -1);
            return {
              ...item,
              viewerHasLiked: liked,
              likesCount: Math.max(0, count),
            };
          })
        );
      }
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["gallery", "approved"], ctx.prev);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery", "approved"] });
      queryClient.invalidateQueries({ queryKey: ["gallery", "my"] });
    },
  });
};

export const useDeleteMyGallerySubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMyGallerySubmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery", "my"] });
    },
  });
};

export const useGalleryLikes = (id?: string) => {
  return useInfiniteQuery<{
    items: GalleryLike[];
    nextCursor: string | null;
  }>({
    queryKey: ["gallery", "likes", id],
    enabled: Boolean(id),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      getGalleryLikes({ id: id!, cursor: pageParam ?? undefined, limit: 50 }),
    getNextPageParam: lastPage => lastPage.nextCursor,
  });
};
