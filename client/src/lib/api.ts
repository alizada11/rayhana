import api from "./axios";

// ---------- Types ----------
export interface UserData {
  [key: string]: any;
}

export type ProductData = FormData;

export interface CommentData {
  productId: string | number;
  content: string;
}

export type BlogPostData = FormData;

export interface BlogListParams {
  page?: number;
  limit?: number;
  featured?: boolean;
  status?: "draft" | "published";
}

export interface UpdateBlogPostParams {
  id: string | number;
  data: FormData;
}

export interface BlogCommentData {
  blogId: string | number;
  content: string;
}

export interface UpdateBlogCommentParams {
  blogId: string | number;
  commentId: string | number;
  content: string;
}

export interface DeleteBlogCommentParams {
  blogId: string | number;
  commentId: string | number;
}

export interface UpdateProductParams {
  id: string | number;
  data: FormData;
}

export interface DeleteCommentParams {
  commentId: string | number;
}

export interface GallerySubmissionPayload {
  dishName: string;
  description?: string;
}

// ---------- USERS API ----------
export const syncUser = async (userData: UserData) => {
  const { data } = await api.post("/users/sync", userData);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get("/users/me");
  return data;
};

// ---------- GALLERY API ----------
export const getApprovedGallery = async () => {
  const { data } = await api.get("/gallery");
  return data;
};

export const getMyGallery = async () => {
  const { data } = await api.get("/gallery/my");
  return data;
};

export const getAllGallery = async () => {
  const { data } = await api.get("/gallery/admin");
  return data;
};

export const createGallerySubmission = async (payload: FormData) => {
  const { data } = await api.post("/gallery", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const approveGallerySubmission = async (id: string) => {
  const { data } = await api.patch(`/gallery/${id}/approve`);
  return data;
};

export const rejectGallerySubmission = async (id: string) => {
  const { data } = await api.patch(`/gallery/${id}/reject`);
  return data;
};

export const deleteGallerySubmission = async (id: string) => {
  const { data } = await api.delete(`/gallery/${id}`);
  return data;
};

export const toggleGalleryLike = async (id: string) => {
  const { data } = await api.post(`/gallery/${id}/like`);
  return data;
};

export const deleteMyGallerySubmission = async (id: string) => {
  const { data } = await api.delete(`/gallery/my/${id}`);
  return data;
};

// ---------- PRODUCTS API ----------
export const getAllProducts = async () => {
  const { data } = await api.get("/products");
  return data;
};

export const getProductById = async (id: string | number) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const getMyProducts = async () => {
  const { data } = await api.get("/products/my");
  return data;
};

export const createProduct = async (productData: ProductData) => {
  const { data } = await api.post("/products", productData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateProduct = async ({
  id,
  data: productData,
}: UpdateProductParams) => {
  const { data } = await api.put(`/products/${id}`, productData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteProduct = async (id: string | number) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

// ---------- BLOG API ----------
export const getBlogPosts = async (params: BlogListParams = {}) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.featured !== undefined) {
    searchParams.set("featured", params.featured ? "1" : "0");
  }
  if (params.status) searchParams.set("status", params.status);

  const query = searchParams.toString();
  const { data } = await api.get(`/blogs${query ? `?${query}` : ""}`);
  return data;
};

export const getBlogPostBySlug = async (slug: string | number) => {
  const { data } = await api.get(`/blogs/${slug}`);
  return data;
};

export const createBlogPost = async (payload: BlogPostData) => {
  const { data } = await api.post("/blogs", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateBlogPost = async ({
  id,
  data: blogData,
}: UpdateBlogPostParams) => {
  const { data } = await api.put(`/blogs/${id}`, blogData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteBlogPost = async (id: string | number) => {
  const { data } = await api.delete(`/blogs/${id}`);
  return data;
};

export const getBlogComments = async (blogId: string | number) => {
  const { data } = await api.get(`/blogs/${blogId}/comments`);
  return data;
};

export const createBlogComment = async ({ blogId, content }: BlogCommentData) => {
  const { data } = await api.post(`/blogs/${blogId}/comments`, { content });
  return data;
};

export const updateBlogComment = async ({
  blogId,
  commentId,
  content,
}: UpdateBlogCommentParams) => {
  const { data } = await api.put(`/blogs/${blogId}/comments/${commentId}`, {
    content,
  });
  return data;
};

export const deleteBlogComment = async ({
  blogId,
  commentId,
}: DeleteBlogCommentParams) => {
  const { data } = await api.delete(`/blogs/${blogId}/comments/${commentId}`);
  return data;
};

// ---------- COMMENTS API ----------
export const createComment = async ({ productId, content }: CommentData) => {
  const { data } = await api.post(`/comments/${productId}`, { content });
  return data;
};

export const deleteComment = async ({ commentId }: DeleteCommentParams) => {
  const { data } = await api.delete(`/comments/${commentId}`);
  return data;
};
