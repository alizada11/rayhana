import api from "./axios";

// ---------- Types ----------
export interface UserData {
  [key: string]: any;
}

export type UserRole = "admin" | "guest";

export interface UserStats {
  gallerySubmissions: number;
  galleryLikes: number;
  blogPosts: number;
  blogComments: number;
  products: number;
  mediaAssets: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name?: string | null;
  imageUrl?: string | null;
  role: UserRole;
  createdAt?: string | null;
  updatedAt?: string | null;
  stats: UserStats;
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
  website?: string; // honeypot
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

export interface SiteContentPayload {
  [key: string]: any;
}

export interface MediaUploadPayload {
  file: File;
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

export interface GalleryLikeUser {
  id: string;
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
}

export interface GalleryLike {
  id: string;
  userId: string;
  submissionId: string;
  user?: GalleryLikeUser | null;
}

export interface GalleryLikesResponse {
  items: GalleryLike[];
  nextCursor: string | null;
}

// Contact
export interface ContactMessagePayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
  website?: string; // honeypot
}

export interface ContactMessage extends ContactMessagePayload {
  id: string;
  status: "new" | "resolved";
  createdAt: string;
  updatedAt: string;
}

// Newsletter
export interface NewsletterSubscription {
  id: string;
  email: string;
  country?: string | null;
  ip?: string | null;
  createdAt: string;
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

export const getUsersAdmin = async ({
  search,
  role,
  cursor,
  limit,
}: {
  search?: string;
  role?: UserRole | "all";
  cursor?: string | null;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (role && role !== "all") params.set("role", role);
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  const { data } = await api.get(`/users/admin${params.toString() ? `?${params}` : ""}`);
  return data as { items: AdminUser[]; nextCursor: string | null };
};

export const getUserAdmin = async (id: string) => {
  const { data } = await api.get(`/users/admin/${id}`);
  return data as AdminUser;
};

export const updateUserAdmin = async ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<Pick<AdminUser, "name" | "email" | "role">>;
}) => {
  const { data } = await api.patch(`/users/admin/${id}`, payload);
  return data as AdminUser;
};

export const deleteUserAdmin = async (id: string) => {
  const { data } = await api.delete(`/users/admin/${id}`);
  return data as { deletedId: string; impact?: AdminUser };
};

// Guest profile
export interface GuestProfile extends AdminUser {
  emailVerifiedAt?: string | null;
  passwordSet?: boolean;
}

export const getMyProfile = async () => {
  const { data } = await api.get("/users/profile");
  return data as GuestProfile;
};

export const updateMyProfile = async (payload: {
  name?: string;
  email?: string;
  imageUrl?: string;
}) => {
  const { data } = await api.patch("/users/profile", payload);
  return data as GuestProfile;
};

export const changeMyPassword = async (payload: {
  currentPassword?: string;
  newPassword: string;
}) => {
  const { data } = await api.post("/users/profile/password", payload);
  return data as { success: boolean; message?: string };
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

export interface GalleryUploadRequest {
  payload: FormData;
  onProgress?: (percent: number) => void;
}

export const createGallerySubmission = async ({
  payload,
  onProgress,
}: GalleryUploadRequest) => {
  const { data } = await api.post("/gallery", payload, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: event => {
      if (!onProgress) return;
      const ratio =
        event.progress ??
        (event.total ? event.loaded / event.total : undefined);
      if (ratio === undefined) return;
      const percent = Math.round(ratio * 100);
      onProgress(Math.min(100, Math.max(0, percent)));
    },
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

export const getGalleryLikes = async ({
  id,
  cursor,
  limit,
}: {
  id: string;
  cursor?: string | null;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  const query = params.toString();
  const { data } = await api.get(
    `/gallery/${id}/likes${query ? `?${query}` : ""}`
  );
  return data as GalleryLikesResponse;
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

export const getAllBlogComments = async ({
  cursor,
  limit,
}: {
  cursor?: string | null;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  const { data } = await api.get(
    `/blogs/admin/comments${params.toString() ? `?${params.toString()}` : ""}`
  );
  return data as { items: BlogComment[]; nextCursor: string | null };
};

export const createBlogComment = async ({
  blogId,
  content,
  website,
}: BlogCommentData) => {
  const { data } = await api.post(`/blogs/${blogId}/comments`, {
    content,
    website,
  });
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

export const approveBlogComment = async ({
  blogId,
  commentId,
}: {
  blogId: string | number;
  commentId: string | number;
}) => {
  const { data } = await api.patch(
    `/blogs/${blogId}/comments/${commentId}/approve`
  );
  return data;
};

// ---------- SITE CONTENT API ----------
export const getContentByKey = async (key: string) => {
  const { data } = await api.get(`/content/${key}`);
  return data;
};

export const upsertContent = async (key: string, payload: SiteContentPayload) => {
  const { data } = await api.put(`/content/${key}`, payload);
  return data;
};

export const getAllContent = async () => {
  const { data } = await api.get("/content");
  return data;
};

// ---------- MEDIA API ----------
export const uploadMedia = async ({ file }: MediaUploadPayload) => {
  const payload = new FormData();
  payload.append("file", file);
  const { data } = await api.post("/media/avatar", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteAvatarMedia = async (id: string) => {
  const { data } = await api.delete(`/media/avatar/${id}`);
  return data;
};

export const getMedia = async ({
  cursor,
  limit,
}: {
  cursor?: string | null;
  limit?: number;
} = {}) => {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  const { data } = await api.get(`/media${params.toString() ? `?${params}` : ""}`);
  return data as { items: MediaAsset[]; nextCursor: string | null };
};

export const deleteMedia = async (id: string | number) => {
  const { data } = await api.delete(`/media/${id}`);
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

// ---------- CONTACT API ----------
export const sendContactMessage = async (payload: ContactMessagePayload) => {
  const { data } = await api.post("/contact", payload);
  return data as ContactMessage;
};

export const getContactMessages = async ({
  status,
  cursor,
  limit,
}: {
  status?: "new" | "resolved";
  cursor?: string | null;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  const query = params.toString();
  const { data } = await api.get(`/contact/messages${query ? `?${query}` : ""}`);
  return data as { items: ContactMessage[]; nextCursor: string | null };
};

export const updateContactMessageStatus = async (
  id: string,
  status: "new" | "resolved"
) => {
  const { data } = await api.patch(`/contact/messages/${id}`, { status });
  return data as ContactMessage;
};

export const deleteContactMessage = async (id: string) => {
  const { data } = await api.delete(`/contact/messages/${id}`);
  return data as ContactMessage;
};

// ---------- NEWSLETTER API ----------
export const subscribeNewsletter = async (email: string, country?: string) => {
  const { data } = await api.post("/newsletter", { email, country });
  return data as NewsletterSubscription;
};

export const getNewsletterSubscriptions = async ({
  from,
  to,
  country,
  search,
  cursor,
  limit,
}: {
  from?: string;
  to?: string;
  country?: string;
  search?: string;
  cursor?: string | null;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (country) params.set("country", country);
  if (search) params.set("search", search);
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  const { data } = await api.get(
    `/newsletter/admin${params.toString() ? `?${params.toString()}` : ""}`
  );
  return data as { items: NewsletterSubscription[]; nextCursor: string | null };
};

export const exportNewsletterCsv = async (params: {
  from?: string;
  to?: string;
  country?: string;
  search?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.country) searchParams.set("country", params.country);
  if (params.search) searchParams.set("search", params.search);

  const response = await api.get(
    `/newsletter/admin/export${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`,
    { responseType: "blob" }
  );
  return response.data as Blob;
};
export interface MediaAsset {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  createdAt?: string;
}
export interface DashboardStats {
  users: number;
  blogs: number;
  gallery: number;
  newsletter: number;
}

export const getDashboardStats = async () => {
  const { data } = await api.get("/dashboard/stats");
  return data as DashboardStats;
};
export interface BlogComment {
  id: string;
  content?: string;
  blogId: string;
  createdAt?: string;
  user?: { name?: string | null; email?: string | null } | null;
  blog?: { title?: Record<string, string> | null; slug?: string | null } | null;
}
