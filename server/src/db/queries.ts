import { db } from "./index";
import { eq, and, sql, desc, lt, or } from "drizzle-orm";
import {
  users,
  comments,
  products,
  blogPosts,
  blogComments,
  siteContent,
  mediaAssets,
  gallerySubmissions,
  galleryLikes,
  type NewUser,
  type NewComment,
  type NewProduct,
  type NewBlogPost,
  type NewBlogComment,
  type NewSiteContent,
  type NewMediaAsset,
  type NewGallerySubmission,
  type NewGalleryLike,
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
      ? whereClauses.reduce((acc, clause) =>
          acc ? and(acc, clause) : clause
        )
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
  let cursorLike:
    | { id: string; createdAt: Date | null }
    | null
    | undefined = null;

  if (cursorId) {
    cursorLike = await db.query.galleryLikes.findFirst({
      where: eq(galleryLikes.id, cursorId),
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
