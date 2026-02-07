import { db } from "./index";
import { eq, and, sql } from "drizzle-orm";
import {
  users,
  comments,
  products,
  gallerySubmissions,
  galleryLikes,
  type NewUser,
  type NewComment,
  type NewProduct,
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
