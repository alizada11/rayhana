import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment, deleteComment } from "../lib/api";

// ---------- Types ----------
export type ID = string | number;

export interface CreateCommentVariables {
  productId: ID;
  content: string;
}

export interface DeleteCommentVariables {
  commentId: ID;
}

// ---------- Hooks ----------
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onSuccess: (_, variables: CreateCommentVariables) => {
      queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
    },
  });
};

export const useDeleteComment = (productId: ID) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product", productId],
      });
    },
  });
};
