import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteMedia, getMedia, uploadMedia } from "@/lib/api";

export const useMedia = () => {
  return useQuery({
    queryKey: ["media"],
    queryFn: getMedia,
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
