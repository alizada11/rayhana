import { db } from "./index";
import { eq, and, sql, desc, lt, or, gte, lte } from "drizzle-orm";
import {
  users,
  authSessions,
  passwordResetTokens,
  emailVerificationTokens,
  oauthAccounts,
  comments,
  products,
  blogPosts,
  blogComments,
  siteContent,
  mediaAssets,
  gallerySubmissions,
  galleryLikes,
  contactMessages,
  newsletterSubscriptions,
  type NewUser,
  type NewAuthSession,
  type NewPasswordResetToken,
  type NewEmailVerificationToken,
  type NewOauthAccount,
  type NewComment,
  type NewProduct,
  type NewBlogPost,
  type NewBlogComment,
  type NewSiteContent,
  type NewMediaAsset,
  type NewGallerySubmission,
  type NewGalleryLike,
  type NewContactMessage,
  type NewNewsletterSubscription,
} from "./schema";

// USER QUERIES
export const createUser = async (data: NewUser) => {
  const [user] = await db.insert(users).values(data).returning();
  return user;
};

export const getUserById = async (id: string) => {
  return db.query.users.findFirst({ where: eq(users.id, id) });
};

export const updateUser = async (id: string, data: Partial<NewUser>) => {
  const existingUser = await getUserById(id);
  if (!existingUser) {
    throw new Error(`User with id ${id} not found`);
  }

  const [user] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning();
  return user;
};

// upsert => create or update

export const upsertUser = async (data: NewUser) => {
  // this is what we have done first
  // const existingUser = await getUserById(data.id);
  // if (existingUser) return updateUser(data.id, data);

  // return createUser(data);

  // and this is what CR suggested
  const [user] = await db
    .insert(users)
    .values(data)
    .onConflictDoUpdate({
      target: users.id,
      set: data,
    })
    .returning();
  return user;
};

// AUTH QUERIES
export const createSession = async (data: NewAuthSession) => {
  const [session] = await db.insert(authSessions).values(data).returning();
  return session;
};

export const findSessionByTokenHash = async (tokenHash: string) => {
  return db.query.authSessions.findFirst({
    where: and(
      eq(authSessions.tokenHash, tokenHash),
      eq(authSessions.revoked, false),
      gte(authSessions.expiresAt, new Date())
    ),
  });
};

export const revokeSessionById = async (id: string) => {
  const [session] = await db
    .update(authSessions)
    .set({ revoked: true })
    .where(eq(authSessions.id, id))
    .returning();
  return session;
};

export const revokeSessionsByUserId = async (userId: string) => {
  await db
    .update(authSessions)
    .set({ revoked: true })
    .where(eq(authSessions.userId, userId));
};

export const createPasswordResetToken = async (data: NewPasswordResetToken) => {
  const [token] = await db.insert(passwordResetTokens).values(data).returning();
  return token;
};

export const createEmailVerificationToken = async (
  data: NewEmailVerificationToken
) => {
  const [token] = await db
    .insert(emailVerificationTokens)
    .values(data)
    .returning();
  return token;
};

export const findValidEmailVerificationToken = async (tokenHash: string) => {
  return db.query.emailVerificationTokens.findFirst({
    where: and(
      eq(emailVerificationTokens.tokenHash, tokenHash),
      eq(emailVerificationTokens.used, false),
      gte(emailVerificationTokens.expiresAt, new Date())
    ),
  });
};

export const markEmailVerificationTokenUsed = async (id: string) => {
  await db
    .update(emailVerificationTokens)
    .set({ used: true })
    .where(eq(emailVerificationTokens.id, id));
};

export const findValidPasswordResetToken = async (tokenHash: string) => {
  return db.query.passwordResetTokens.findFirst({
    where: and(
      eq(passwordResetTokens.tokenHash, tokenHash),
      eq(passwordResetTokens.used, false),
      gte(passwordResetTokens.expiresAt, new Date())
    ),
  });
};

export const markPasswordResetTokenUsed = async (id: string) => {
  await db
    .update(passwordResetTokens)
    .set({ used: true })
    .where(eq(passwordResetTokens.id, id));
};

export const upsertOauthAccount = async (data: NewOauthAccount) => {
  const [record] = await db
    .insert(oauthAccounts)
    .values(data)
    .onConflictDoUpdate({
      target: [oauthAccounts.provider, oauthAccounts.providerUserId],
      set: {
        userId: data.userId,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      },
    })
    .returning();
  return record;
};

export const findOauthAccount = async (
  provider: string,
  providerUserId: string
) => {
  return db.query.oauthAccounts.findFirst({
    where: and(
      eq(oauthAccounts.provider, provider),
      eq(oauthAccounts.providerUserId, providerUserId)
    ),
  });
};

// PRODUCT QUERIES
export const createProduct = async (data: NewProduct) => {
  const [product] = await db.insert(products).values(data).returning();
  return product;
};

export const getAllProducts = async () => {
  return db.query.products.findMany({
    with: { user: true },
    orderBy: (products, { desc }) => [desc(products.createdAt)], // desc means: you will see the latest products first
    // the square brackets are required because Drizzle ORM's orderBy expects an array, even for a single column.
  });
};

export const getProductById = async (id: string) => {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      user: true,
      comments: {
        with: { user: true },
        orderBy: (comments, { desc }) => [desc(comments.createdAt)],
      },
    },
  });
};

export const getProductsByUserId = async (userId: string) => {
  return db.query.products.findMany({
    where: eq(products.userId, userId),
    with: { user: true },
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });
};

export const updateProduct = async (id: string, data: Partial<NewProduct>) => {
  const existingProduct = await getProductById(id);
  if (!existingProduct) {
    throw new Error(`Product with id ${id} not found`);
  }

  const [product] = await db
    .update(products)
    .set(data)
    .where(eq(products.id, id))
    .returning();
  return product;
};

export const deleteProduct = async (id: string) => {
  const existingProduct = await getProductById(id);
  if (!existingProduct) {
    throw new Error(`Product with id ${id} not found`);
  }

  const [product] = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning();
  return product;
};

// COMMENT QUERIES
export const createComment = async (data: NewComment) => {
  const [comment] = await db.insert(comments).values(data).returning();
  return comment;
};

export const deleteComment = async (id: string) => {
  const existingComment = await getCommentById(id);
  if (!existingComment) {
    throw new Error(`Comment with id ${id} not found`);
  }

  const [comment] = await db
    .delete(comments)
    .where(eq(comments.id, id))
    .returning();
  return comment;
};

export const getCommentById = async (id: string) => {
  return db.query.comments.findFirst({
    where: eq(comments.id, id),
    with: { user: true },
  });
};

// BLOG QUERIES
export const createBlogPost = async (data: NewBlogPost) => {
  const [post] = await db.insert(blogPosts).values(data).returning();
  return post;
};

type BlogListFilters = {
  includeDrafts?: boolean;
  featured?: boolean;
  status?: "draft" | "published";
  page?: number;
  limit?: number;
};

export const getBlogPostsPaginated = async (filters: BlogListFilters = {}) => {
  const includeDrafts = Boolean(filters.includeDrafts);
  const featured = filters.featured;
  const status = filters.status;
  const page = Math.max(1, Number(filters.page || 1));
  const limit = Math.max(1, Math.min(50, Number(filters.limit || 9)));
  const offset = (page - 1) * limit;

  const whereClauses = [
    !includeDrafts ? eq(blogPosts.status, "published") : undefined,
    status ? eq(blogPosts.status, status) : undefined,
    featured !== undefined ? eq(blogPosts.featured, featured) : undefined,
  ].filter(Boolean);

  const where =
    whereClauses.length > 0
      ? whereClauses.reduce((acc, clause) => (acc ? and(acc, clause) : clause))
      : undefined;

  const [countRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(blogPosts)
    .where(where);

  const total = Number(countRow?.count ?? 0);

  const items = await db.query.blogPosts.findMany({
    where,
    with: { user: true },
    orderBy: [desc(blogPosts.publishedAt)],
    limit,
    offset,
  });

  return {
    items,
    total,
    page,
    pageSize: limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

export const getBlogPostById = async (id: string) => {
  return db.query.blogPosts.findFirst({
    where: eq(blogPosts.id, id),
    with: {
      user: true,
      comments: {
        with: { user: true },
        orderBy: (blogComments, { desc }) => [desc(blogComments.createdAt)],
      },
    },
  });
};

export const getBlogPostBySlug = async (slug: string) => {
  return db.query.blogPosts.findFirst({
    where: eq(blogPosts.slug, slug),
    with: {
      user: true,
      comments: {
        with: { user: true },
        orderBy: (blogComments, { desc }) => [desc(blogComments.createdAt)],
      },
    },
  });
};

export const updateBlogPost = async (
  id: string,
  data: Partial<NewBlogPost>
) => {
  const existingPost = await getBlogPostById(id);
  if (!existingPost) {
    throw new Error(`Blog post with id ${id} not found`);
  }

  const [post] = await db
    .update(blogPosts)
    .set(data)
    .where(eq(blogPosts.id, id))
    .returning();
  return post;
};

export const deleteBlogPost = async (id: string) => {
  const existingPost = await getBlogPostById(id);
  if (!existingPost) {
    throw new Error(`Blog post with id ${id} not found`);
  }

  const [post] = await db
    .delete(blogPosts)
    .where(eq(blogPosts.id, id))
    .returning();
  return post;
};

export const createBlogComment = async (data: NewBlogComment) => {
  const [comment] = await db.insert(blogComments).values(data).returning();
  return comment;
};

export const updateBlogComment = async (
  id: string,
  data: Partial<NewBlogComment>
) => {
  const existingComment = await getBlogCommentById(id);
  if (!existingComment) {
    throw new Error(`Blog comment with id ${id} not found`);
  }

  const [comment] = await db
    .update(blogComments)
    .set(data)
    .where(eq(blogComments.id, id))
    .returning();
  return comment;
};

export const deleteBlogComment = async (id: string) => {
  const existingComment = await getBlogCommentById(id);
  if (!existingComment) {
    throw new Error(`Blog comment with id ${id} not found`);
  }

  const [comment] = await db
    .delete(blogComments)
    .where(eq(blogComments.id, id))
    .returning();
  return comment;
};

export const getAllBlogCommentsPaged = async ({
  limit,
  cursorId,
}: {
  limit: number;
  cursorId?: string | null;
}) => {
  let cursor: { id: string; createdAt: Date | null } | null | undefined = null;

  if (cursorId) {
    cursor = await db.query.blogComments.findFirst({
      where: eq(blogComments.id, cursorId),
      columns: { id: true, createdAt: true },
    });
  }

  const items = await db.query.blogComments.findMany({
    with: { user: true, blog: true },
    where: cursor
      ? or(
          lt(blogComments.createdAt, cursor.createdAt ?? new Date(0)),
          and(
            eq(blogComments.createdAt, cursor.createdAt ?? new Date(0)),
            lt(blogComments.id, cursor.id)
          )
        )
      : undefined,
    orderBy: [desc(blogComments.createdAt), desc(blogComments.id)],
    limit,
  });

  const nextCursor = items.length === limit ? items[items.length - 1].id : null;
  return { items, nextCursor };
};

export const getBlogCommentById = async (id: string) => {
  return db.query.blogComments.findFirst({
    where: eq(blogComments.id, id),
    with: { user: true, blog: true },
  });
};

export const getBlogCommentsByBlogId = async (blogId: string) => {
  return db.query.blogComments.findMany({
    where: eq(blogComments.blogId, blogId),
    with: { user: true },
    orderBy: (blogComments, { desc }) => [desc(blogComments.createdAt)],
  });
};

// SITE CONTENT QUERIES
export const getSiteContentByKey = async (key: string) => {
  return db.query.siteContent.findFirst({
    where: eq(siteContent.key, key),
  });
};

export const upsertSiteContent = async (data: NewSiteContent) => {
  const [row] = await db
    .insert(siteContent)
    .values(data)
    .onConflictDoUpdate({
      target: siteContent.key,
      set: { data: data.data },
    })
    .returning();
  return row;
};

export const getAllSiteContent = async () => {
  return db.query.siteContent.findMany();
};

// MEDIA QUERIES
export const createMediaAsset = async (data: NewMediaAsset) => {
  const [asset] = await db.insert(mediaAssets).values(data).returning();
  return asset;
};

export const getMediaAssets = async () => {
  return db.query.mediaAssets.findMany({
    with: { user: true },
    orderBy: (mediaAssets, { desc }) => [desc(mediaAssets.createdAt)],
  });
};

export const getMediaAssetsPaged = async ({
  limit,
  cursorId,
}: {
  limit: number;
  cursorId?: string | null;
}) => {
  let cursor: { id: string; createdAt: Date | null } | null | undefined = null;

  if (cursorId) {
    cursor = await db.query.mediaAssets.findFirst({
      where: eq(mediaAssets.id, cursorId),
      columns: { id: true, createdAt: true },
    });
  }

  const items = await db.query.mediaAssets.findMany({
    where: cursor
      ? or(
          lt(mediaAssets.createdAt, cursor.createdAt ?? new Date(0)),
          and(
            eq(mediaAssets.createdAt, cursor.createdAt ?? new Date(0)),
            lt(mediaAssets.id, cursor.id)
          )
        )
      : undefined,
    with: { user: true },
    orderBy: [desc(mediaAssets.createdAt), desc(mediaAssets.id)],
    limit,
  });

  const nextCursor = items.length === limit ? items[items.length - 1].id : null;
  return { items, nextCursor };
};

export const deleteMediaAsset = async (id: string) => {
  const [asset] = await db
    .delete(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .returning();
  return asset;
};

// GALLERY QUERIES
export const createGallerySubmission = async (data: NewGallerySubmission) => {
  const [submission] = await db
    .insert(gallerySubmissions)
    .values(data)
    .returning();
  return submission;
};

export const getApprovedGallerySubmissions = async () => {
  return db.query.gallerySubmissions.findMany({
    where: eq(gallerySubmissions.status, "approved"),
    with: { user: true },
    orderBy: (gallerySubmissions, { desc }) => [
      desc(gallerySubmissions.createdAt),
    ],
  });
};

export const getAllGallerySubmissions = async () => {
  return db.query.gallerySubmissions.findMany({
    with: { user: true },
    orderBy: (gallerySubmissions, { desc }) => [
      desc(gallerySubmissions.createdAt),
    ],
  });
};

export const getGallerySubmissionsByUserId = async (userId: string) => {
  return db.query.gallerySubmissions.findMany({
    where: eq(gallerySubmissions.userId, userId),
    with: { user: true },
    orderBy: (gallerySubmissions, { desc }) => [
      desc(gallerySubmissions.createdAt),
    ],
  });
};

export const getGalleryLikesByUserId = async (userId: string) => {
  return db.query.galleryLikes.findMany({
    where: eq(galleryLikes.userId, userId),
  });
};

export const getGalleryLikesBySubmissionId = async (
  submissionId: string,
  limit: number,
  cursorId?: string | null
) => {
  let cursorLike: { id: string; createdAt: Date | null } | null | undefined =
    null;

  if (cursorId) {
    cursorLike = await db.query.galleryLikes.findFirst({
      where: and(
        eq(galleryLikes.id, cursorId),
        eq(galleryLikes.submissionId, submissionId)
      ),
      columns: { id: true, createdAt: true },
    });
  }

  const items = await db.query.galleryLikes.findMany({
    where: cursorLike
      ? and(
          eq(galleryLikes.submissionId, submissionId),
          or(
            lt(galleryLikes.createdAt, cursorLike.createdAt ?? new Date(0)),
            and(
              eq(galleryLikes.createdAt, cursorLike.createdAt ?? new Date(0)),
              lt(galleryLikes.id, cursorLike.id)
            )
          )
        )
      : eq(galleryLikes.submissionId, submissionId),
    with: { user: true },
    orderBy: [
      desc(galleryLikes.createdAt),
      desc(galleryLikes.id), // tie-breaker for stable ordering
    ],
    limit,
  });

  const nextCursor = items.length === limit ? items[items.length - 1].id : null;

  return { items, nextCursor };
};

export const updateGallerySubmissionStatus = async (
  id: string,
  status: "pending" | "approved" | "rejected"
) => {
  const [submission] = await db
    .update(gallerySubmissions)
    .set({ status })
    .where(eq(gallerySubmissions.id, id))
    .returning();
  return submission;
};

export const deleteGallerySubmission = async (id: string) => {
  const [submission] = await db
    .delete(gallerySubmissions)
    .where(eq(gallerySubmissions.id, id))
    .returning();
  return submission;
};

export const toggleGalleryLike = async (
  submissionId: string,
  userId: string
) => {
  return db.transaction(async tx => {
    const existing = await tx.query.galleryLikes.findFirst({
      where: and(
        eq(galleryLikes.submissionId, submissionId),
        eq(galleryLikes.userId, userId)
      ),
    });

    if (existing) {
      await tx
        .delete(galleryLikes)
        .where(eq(galleryLikes.id, existing.id))
        .returning();

      await tx
        .update(gallerySubmissions)
        .set({
          likesCount: sql`${gallerySubmissions.likesCount} - 1`,
        })
        .where(eq(gallerySubmissions.id, submissionId))
        .returning();

      return { liked: false };
    }

    const [like] = await tx
      .insert(galleryLikes)
      .values({ submissionId, userId } as NewGalleryLike)
      .returning();

    await tx
      .update(gallerySubmissions)
      .set({
        likesCount: sql`${gallerySubmissions.likesCount} + 1`,
      })
      .where(eq(gallerySubmissions.id, submissionId))
      .returning();

    return { liked: true, like };
  });
};

// CONTACT MESSAGES
export const createContactMessage = async (data: NewContactMessage) => {
  const [record] = await db.insert(contactMessages).values(data).returning();
  return record;
};

export const listContactMessages = async ({
  status,
  limit,
  cursorId,
}: {
  status?: "new" | "resolved";
  limit: number;
  cursorId?: string | null;
}) => {
  let cursor: { id: string; createdAt: Date | null } | null | undefined = null;

  if (cursorId) {
    cursor = await db.query.contactMessages.findFirst({
      where: eq(contactMessages.id, cursorId),
      columns: { id: true, createdAt: true },
    });
  }

  const items = await db.query.contactMessages.findMany({
    where: and(
      status ? eq(contactMessages.status, status) : undefined,
      cursor
        ? or(
            lt(contactMessages.createdAt, cursor.createdAt ?? new Date(0)),
            and(
              eq(contactMessages.createdAt, cursor.createdAt ?? new Date(0)),
              lt(contactMessages.id, cursor.id)
            )
          )
        : undefined
    ),
    orderBy: [desc(contactMessages.createdAt), desc(contactMessages.id)],
    limit,
  });

  const nextCursor = items.length === limit ? items[items.length - 1].id : null;
  return { items, nextCursor };
};

export const updateContactMessageStatus = async (
  id: string,
  status: "new" | "resolved"
) => {
  const [record] = await db
    .update(contactMessages)
    .set({ status })
    .where(eq(contactMessages.id, id))
    .returning();
  if (!record) {
    throw new Error(`Contact message with id ${id} not found`);
  }
  return record;
};

export const deleteContactMessage = async (id: string) => {
  const [record] = await db
    .delete(contactMessages)
    .where(eq(contactMessages.id, id))
    .returning();
  if (!record) {
    throw new Error(`Contact message with id ${id} not found`);
  }
  return record;
};

// NEWSLETTER SUBSCRIPTIONS
export const createNewsletterSubscription = async (
  data: NewNewsletterSubscription
) => {
  const [record] = await db
    .insert(newsletterSubscriptions)
    .values(data)
    .returning();
  return record;
};

export const getNewsletterSubscriptionByEmail = async (email: string) => {
  return db.query.newsletterSubscriptions.findFirst({
    where: eq(newsletterSubscriptions.email, email),
  });
};

export const listNewsletterSubscriptions = async ({
  from,
  to,
  country,
  search,
  limit,
  cursorId,
}: {
  from?: Date;
  to?: Date;
  country?: string;
  search?: string;
  limit: number;
  cursorId?: string | null;
}) => {
  const filters = [];
  if (from) filters.push(gte(newsletterSubscriptions.createdAt, from));
  if (to) filters.push(lte(newsletterSubscriptions.createdAt, to));
  if (country)
    filters.push(
      sql`LOWER(${newsletterSubscriptions.country}) = ${country.trim().toLowerCase()}`
    );
  if (search) {
    const term = `%${search.toLowerCase()}%`;
    filters.push(
      sql`(LOWER(${newsletterSubscriptions.email}) LIKE ${term} OR LOWER(${newsletterSubscriptions.country}) LIKE ${term})`
    );
  }

  let cursor: { id: string; createdAt: Date | null } | null | undefined = null;
  if (cursorId) {
    cursor = await db.query.newsletterSubscriptions.findFirst({
      where: eq(newsletterSubscriptions.id, cursorId),
      columns: { id: true, createdAt: true },
    });
  }

  const items = await db.query.newsletterSubscriptions.findMany({
    where: and(
      ...filters,
      cursor
        ? or(
            lt(
              newsletterSubscriptions.createdAt,
              cursor.createdAt ?? new Date(0)
            ),
            and(
              eq(
                newsletterSubscriptions.createdAt,
                cursor.createdAt ?? new Date(0)
              ),
              lt(newsletterSubscriptions.id, cursor.id)
            )
          )
        : undefined
    ),
    orderBy: [
      desc(newsletterSubscriptions.createdAt),
      desc(newsletterSubscriptions.id),
    ],
    limit,
  });

  const nextCursor = items.length === limit ? items[items.length - 1].id : null;
  return { items, nextCursor };
};

export const exportNewsletterSubscriptions = async (params: {
  from?: Date;
  to?: Date;
  country?: string;
  search?: string;
}) => {
  const { from, to, country, search } = params;
  const filters = [];
  if (from) filters.push(gte(newsletterSubscriptions.createdAt, from));
  if (to) filters.push(lte(newsletterSubscriptions.createdAt, to));
  if (country)
    filters.push(
      sql`LOWER(${newsletterSubscriptions.country}) = ${country.trim().toLowerCase()}`
    );
  if (search) {
    const term = `%${search.toLowerCase()}%`;
    filters.push(
      sql`(LOWER(${newsletterSubscriptions.email}) LIKE ${term} OR LOWER(${newsletterSubscriptions.country}) LIKE ${term})`
    );
  }

  return db.query.newsletterSubscriptions.findMany({
    where: filters.length ? and(...filters) : undefined,
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });
};
export const getDashboardStats = async () => {
  const [usersCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);
  const [blogsCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(blogPosts);
  const [galleryCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(gallerySubmissions);
  const [newsletterCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(newsletterSubscriptions);

  return {
    users: Number(usersCount?.count ?? 0),
    blogs: Number(blogsCount?.count ?? 0),
    gallery: Number(galleryCount?.count ?? 0),
    newsletter: Number(newsletterCount?.count ?? 0),
  };
};
