import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPostBySlug,
  getBlogPosts,
  updateBlogPost,
  getBlogComments,
  createBlogComment,
  updateBlogComment,
  deleteBlogComment,
  type BlogListParams,
} from "@/lib/api";

export type ID = string | number;

export interface BlogPost {
  id: ID;
  slug: string;
  [key: string]: any;
}

export interface BlogListResult {
  items: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UpdateBlogPostVariables {
  id: ID;
  data: FormData;
}

export interface BlogComment {
  id: ID;
  [key: string]: any;
}

export interface BlogCommentInput {
  blogId: ID;
  content: string;
}

export interface UpdateBlogCommentVariables {
  blogId: ID;
  commentId: ID;
  content: string;
}

export interface DeleteBlogCommentVariables {
  blogId: ID;
  commentId: ID;
}

export const useBlogs = (params: BlogListParams) => {
  return useQuery<BlogListResult>({
    queryKey: ["blogs", params],
    queryFn: () => getBlogPosts(params),
  });
};

export const useBlogBySlug = (slug?: ID) => {
  return useQuery<BlogPost>({
    queryKey: ["blog", slug],
    queryFn: () => getBlogPostBySlug(slug as ID),
    enabled: Boolean(slug),
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBlogPost,
    onSuccess: (_, variables: UpdateBlogPostVariables) => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
};

export const useBlogComments = (blogId?: ID) => {
  return useQuery<BlogComment[]>({
    queryKey: ["blogComments", blogId],
    queryFn: () => getBlogComments(blogId as ID),
    enabled: Boolean(blogId),
  });
};

export const useCreateBlogComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBlogComment,
    onSuccess: (_, variables: BlogCommentInput) => {
      queryClient.invalidateQueries({
        queryKey: ["blogComments", variables.blogId],
      });
    },
  });
};

export const useUpdateBlogComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBlogComment,
    onSuccess: (_, variables: UpdateBlogCommentVariables) => {
      queryClient.invalidateQueries({
        queryKey: ["blogComments", variables.blogId],
      });
    },
  });
};

export const useDeleteBlogComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBlogComment,
    onSuccess: (_, variables: DeleteBlogCommentVariables) => {
      queryClient.invalidateQueries({
        queryKey: ["blogComments", variables.blogId],
      });
    },
  });
};
