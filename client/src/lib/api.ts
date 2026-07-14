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
  search?: string;
}

export interface UpdateBlogPostParams {
  id: string | number;
  data: FormData;
}

export interface BlogCommentData {
  blogId: string | number;
  content: string;
  website?: string; // honeypot
  parentId?: string | number;
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
  onProgress?: (percent: number) => void;
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

export type PreLaunchReservationStatus = "pending" | "contacted" | "completed";

export interface PreLaunchReservationPayload {
  productId: string;
  productSize: string;
  fullName: string;
  email: string;
  whatsapp: string;
  region: string;
}

export interface PreLaunchReservation {
  id: string;
  productId: string;
  productSize: string;
  fullName: string;
  email: string;
  whatsapp: string;
  region: string;
  userId?: string | null;
  status: PreLaunchReservationStatus;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    title?: Record<string, string> | string | null;
    imageUrl?: string | null;
  } | null;
  user?: {
    id: string;
    email?: string | null;
    name?: string | null;
  } | null;
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
  const { data } = await api.get(
    `/users/admin${params.toString() ? `?${params}` : ""}`
  );
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

// Product reviews (admin)
export const createProductReview = async ({
  productId,
  review,
}: {
  productId: string | number;
  review: {
    author: string;
    text: Record<string, string>;
    rating: number;
    verified?: boolean;
  };
}) => {
  const { data } = await api.post(`/products/${productId}/reviews`, review);
  return data;
};

export const updateProductReview = async ({
  productId,
  reviewId,
  review,
}: {
  productId: string | number;
  reviewId: string | number;
  review: Partial<{
    author: string;
    text: Record<string, string>;
    rating: number;
    verified: boolean;
  }>;
}) => {
  const { data } = await api.put(
    `/products/${productId}/reviews/${reviewId}`,
    review
  );
  return data;
};

export const deleteProductReview = async ({
  productId,
  reviewId,
}: {
  productId: string | number;
  reviewId: string | number;
}) => {
  const { data } = await api.delete(
    `/products/${productId}/reviews/${reviewId}`
  );
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
  if (params.search) searchParams.set("search", params.search.trim());

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
  parentId,
}: BlogCommentData) => {
  const { data } = await api.post(`/blogs/${blogId}/comments`, {
    content,
    website,
    parentId,
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

export const upsertContent = async (
  key: string,
  payload: SiteContentPayload
) => {
  const { data } = await api.put(`/content/${key}`, payload);
  return data;
};

export const getAllContent = async () => {
  const { data } = await api.get("/content");
  return data;
};

// ---------- MEDIA API ----------
export const uploadMedia = async ({ file, onProgress }: MediaUploadPayload) => {
  const payload = new FormData();
  payload.append("file", file);
  const { data } = await api.post("/media/avatar", payload, {
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
  const { data } = await api.get(
    `/media${params.toString() ? `?${params}` : ""}`
  );
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
  const { data } = await api.get(
    `/contact/messages${query ? `?${query}` : ""}`
  );
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

// ---------- PRE-LAUNCH RESERVATIONS API ----------
export const createPreLaunchReservation = async (
  payload: PreLaunchReservationPayload
) => {
  const { data } = await api.post("/pre-launch-reservations", payload);
  return data as PreLaunchReservation;
};

export const createPreLaunchReservationAdmin = async (
  payload: PreLaunchReservationPayload
) => {
  const { data } = await api.post("/pre-launch-reservations/admin", payload);
  return data as PreLaunchReservation;
};

export const getMyPreLaunchReservations = async () => {
  const { data } = await api.get("/pre-launch-reservations/my");
  return data as PreLaunchReservation[];
};

export const getPreLaunchReservationsAdmin = async ({
  product,
  region,
  status,
  search,
  cursor,
  limit,
}: {
  product?: string;
  region?: string;
  status?: PreLaunchReservationStatus | "all";
  search?: string;
  cursor?: string | null;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  if (product) params.set("product", product);
  if (region) params.set("region", region);
  if (status && status !== "all") params.set("status", status);
  if (search) params.set("search", search);
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  const { data } = await api.get(
    `/pre-launch-reservations/admin${params.toString() ? `?${params}` : ""}`
  );
  return data as { items: PreLaunchReservation[]; nextCursor: string | null };
};

export const updatePreLaunchReservationAdmin = async ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<PreLaunchReservationPayload> & {
    status?: PreLaunchReservationStatus;
  };
}) => {
  const { data } = await api.patch(
    `/pre-launch-reservations/admin/${id}`,
    payload
  );
  return data as PreLaunchReservation;
};

export const deletePreLaunchReservationAdmin = async (id: string) => {
  const { data } = await api.delete(`/pre-launch-reservations/admin/${id}`);
  return data as PreLaunchReservation;
};

// ---------- WORLD CUP CAMPAIGN API ----------
export type CountryCode = string;
export type SemiFinalOneTeam = "FRANCE" | "SPAIN";
export type SemiFinalTwoTeam = "ENGLAND" | "ARGENTINA";
export type WorldCupWinnerStatus =
  | "PENDING"
  | "FIRST"
  | "SECOND"
  | "THIRD"
  | "DISCOUNT"
  | "NOT_WINNER";
export type WorldCupFinalStatus =
  | "COMING_SOON"
  | "OPEN"
  | "CLOSED"
  | "RESULTS";
export type WorldCupFinalChampion = "TEAM_A" | "TEAM_B";
export type WorldCupLotteryCriterion =
  | "ALL_VALID"
  | "CORRECT_ONLY"
  | "NON_PRIZE";

export interface WorldCupPredictionPayload {
  fullName: string;
  email: string;
  country: CountryCode;
  franceSpainAdvances: SemiFinalOneTeam;
  franceSpainFranceScore: number;
  franceSpainSpainScore: number;
  englandArgentinaAdvances: SemiFinalTwoTeam;
  englandArgentinaEnglandScore: number;
  englandArgentinaArgentinaScore: number;
  termsAccepted: true;
}

export interface WorldCupPrediction extends WorldCupPredictionPayload {
  id: string;
  winnerStatus: WorldCupWinnerStatus;
  acceptedTermsAt: string;
  createdAt: string;
  updatedAt: string;
  referenceCode?: string;
}

export interface WorldCupStatus {
  firstMatchDeadline?: number;
  deadline: number;
  isFirstMatchOpen?: boolean;
  isOpen: boolean;
}

export interface WorldCupLiveStats {
  totalPredictions: number;
  matchups: Array<{
    id: string;
    teams: Array<{
      code: string;
      label: string;
      count: number;
      percentage: number;
    }>;
  }>;
}

export interface WorldCupFinalStage {
  teamA: string | null;
  teamB: string | null;
  deadline: number | null;
  status: WorldCupFinalStatus;
  result: {
    teamAScore: number | null;
    teamBScore: number | null;
    champion: WorldCupFinalChampion | null;
  } | null;
}

export interface WorldCupCampaignSettings {
  id: number;
  finalTeamA: string | null;
  finalTeamB: string | null;
  finalDeadline: string | null;
  finalStatus: WorldCupFinalStatus;
  semiFinalFranceScore: number | null;
  semiFinalSpainScore: number | null;
  semiFinalEnglandScore: number | null;
  semiFinalArgentinaScore: number | null;
  finalResultAScore: number | null;
  finalResultBScore: number | null;
  finalChampion: WorldCupFinalChampion | null;
  publicWinnersVisible: boolean;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorldCupFinalPredictionPayload {
  email: string;
  referenceCode: string;
  teamAScore: number;
  teamBScore: number;
  champion: WorldCupFinalChampion;
}

export interface WorldCupFinalPrediction {
  id: string;
  predictionId: string;
  fullName: string;
  email: string;
  teamAScore: number;
  teamBScore: number;
  champion: WorldCupFinalChampion;
  createdAt: string;
}

export interface WorldCupLotteryDraw {
  id: string;
  criterion: WorldCupLotteryCriterion;
  winnerCount: number;
  eligibleCount: number;
  eligibleSnapshot: string;
  auditSeed: string;
  auditHash: string;
  executedBy: string;
  published: boolean;
  executedAt: string;
  winners: Array<{
    position: number;
    predictionId: string;
    fullName: string;
    email: string;
    country: string;
  }>;
}

export interface PublicWorldCupWinners {
  id: string;
  executedAt: string;
  winners: Array<{ position: number; name: string; country: string }>;
}

export const getWorldCupStatus = async () => {
  const { data } = await api.get("/world-cup-campaign/status");
  return data as WorldCupStatus;
};

export const getWorldCupLiveStats = async () => {
  const { data } = await api.get("/world-cup-campaign/live-stats");
  return data as WorldCupLiveStats;
};

export const submitWorldCupPrediction = async (
  payload: WorldCupPredictionPayload
) => {
  const { data } = await api.post("/world-cup-campaign/predictions", payload);
  return data as {
    success: true;
    registrationId: string;
    referenceCode: string;
  };
};

export const getWorldCupFinalStage = async () => {
  const { data } = await api.get("/world-cup-campaign/final-stage");
  return data as WorldCupFinalStage;
};

export const submitWorldCupFinalPrediction = async (
  payload: WorldCupFinalPredictionPayload
) => {
  const { data } = await api.post(
    "/world-cup-campaign/final-predictions",
    payload
  );
  return data as { success: true; participantName: string };
};

export const recoverWorldCupReferenceCode = async (payload: {
  email: string;
}) => {
  const { data } = await api.post(
    "/world-cup-campaign/reference-code",
    payload
  );
  return data as { success: true };
};

export const getPublicWorldCupWinners = async () => {
  const { data } = await api.get("/world-cup-campaign/public-winners");
  return data as PublicWorldCupWinners[];
};

export const getWorldCupPredictionsAdmin = async () => {
  const { data } = await api.get("/world-cup-campaign/admin/predictions");
  return data as WorldCupPrediction[];
};

export const updateWorldCupWinnerStatusAdmin = async ({
  id,
  winnerStatus,
}: {
  id: string;
  winnerStatus: WorldCupWinnerStatus;
}) => {
  const { data } = await api.patch(
    `/world-cup-campaign/admin/predictions/${id}/winner-status`,
    { winnerStatus }
  );
  return data as WorldCupPrediction;
};

export const deleteAllWorldCupPredictionsAdmin = async (payload: {
  confirmation: "I'm sure";
}) => {
  const { data } = await api.delete("/world-cup-campaign/admin/predictions", {
    data: payload,
  });
  return data as { deletedCount: number };
};

export const getWorldCupFinalSettingsAdmin = async () => {
  const { data } = await api.get("/world-cup-campaign/admin/final-settings");
  return data as WorldCupCampaignSettings | null;
};

export const updateWorldCupFinalSettingsAdmin = async (payload: {
  finalTeamA: string | null;
  finalTeamB: string | null;
  finalDeadline: number | null;
  finalStatus: WorldCupFinalStatus;
  semiFinalFranceScore: number | null;
  semiFinalSpainScore: number | null;
  semiFinalEnglandScore: number | null;
  semiFinalArgentinaScore: number | null;
  finalResultAScore: number | null;
  finalResultBScore: number | null;
  finalChampion: WorldCupFinalChampion | null;
  publicWinnersVisible: boolean;
}) => {
  const { data } = await api.put(
    "/world-cup-campaign/admin/final-settings",
    payload
  );
  return data as WorldCupCampaignSettings;
};

export const getWorldCupFinalPredictionsAdmin = async () => {
  const { data } = await api.get(
    "/world-cup-campaign/admin/final-predictions"
  );
  return data as WorldCupFinalPrediction[];
};

export const getWorldCupLotteryEligibilityAdmin = async (
  criterion: WorldCupLotteryCriterion
) => {
  const { data } = await api.get(
    `/world-cup-campaign/admin/lottery-eligibility?criterion=${criterion}`
  );
  return data as { count: number };
};

export const executeWorldCupLotteryAdmin = async (payload: {
  criterion: WorldCupLotteryCriterion;
  winnerCount: number;
  confirmation: "اجرای قطعی";
}) => {
  const { data } = await api.post(
    "/world-cup-campaign/admin/lottery-draws",
    payload
  );
  return data as {
    drawId: string;
    eligibleCount: number;
    auditHash: string;
    winnerEmailCount?: number;
  };
};

export const getWorldCupLotteryDrawsAdmin = async () => {
  const { data } = await api.get("/world-cup-campaign/admin/lottery-draws");
  return data as WorldCupLotteryDraw[];
};

export const publishWorldCupLotteryAdmin = async ({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) => {
  const { data } = await api.patch(
    `/world-cup-campaign/admin/lottery-draws/${id}/publish`,
    { published }
  );
  return data as WorldCupLotteryDraw;
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
