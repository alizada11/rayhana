import { db } from "./index";
import { createHash, createHmac, randomBytes } from "crypto";
import { eq, and, sql, desc, lt, or, gte, lte } from "drizzle-orm";
import { ENV } from "../config/env";
import {
  users,
  authSessions,
  passwordResetTokens,
  emailVerificationTokens,
  oauthAccounts,
  comments,
  products,
  preLaunchReservations,
  productReviews,
  blogPosts,
  blogComments,
  siteContent,
  mediaAssets,
  gallerySubmissions,
  galleryLikes,
  contactMessages,
  newsletterSubscriptions,
  worldCupCampaignSettings,
  worldCupFinalPredictions,
  worldCupLotteryDraws,
  worldCupLotteryWinners,
  worldCupPredictions,
  type NewUser,
  type NewAuthSession,
  type NewPasswordResetToken,
  type NewEmailVerificationToken,
  type NewOauthAccount,
  type NewComment,
  type NewProduct,
  type NewPreLaunchReservation,
  type NewBlogPost,
  type NewBlogComment,
  type NewSiteContent,
  type NewMediaAsset,
  type NewGallerySubmission,
  type NewGalleryLike,
  type NewContactMessage,
  type NewNewsletterSubscription,
  type NewWorldCupPrediction,
  type NewWorldCupCampaignSettings,
} from "./schema";

// USER QUERIES
export const createUser = async (data: NewUser) => {
  const [user] = await db.insert(users).values(data).returning();
  return user;
};

export const getUserById = async (id: string) => {
  return db.query.users.findFirst({ where: eq(users.id, id) });
};

export const getUserByEmail = async (email: string) => {
  return db.query.users.findFirst({ where: eq(users.email, email) });
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

export const countAdmins = async () => {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "admin"));
  return Number(row?.count ?? 0);
};

const userStatsSelect = {
  id: users.id,
  email: users.email,
  name: users.name,
  imageUrl: users.imageUrl,
  role: users.role,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
  passwordSet: sql<boolean>`(${users.passwordHash} is not null)`,
  gallerySubmissionsCount: sql<number>`(
    select count(*) from gallery_submissions
    where gallery_submissions.user_id = users.id
  )`,
  galleryLikesCount: sql<number>`(
    select count(*) from gallery_likes
    where gallery_likes.user_id = users.id
  )`,
  blogPostsCount: sql<number>`(
    select count(*) from blog_posts
    where blog_posts.user_id = users.id
  )`,
  blogCommentsCount: sql<number>`(
    select count(*) from blog_comments
    where blog_comments.user_id = users.id
  )`,
  productsCount: sql<number>`(
    select count(*) from products
    where products.user_id = users.id
  )`,
  mediaAssetsCount: sql<number>`(
    select count(*) from media_assets
    where media_assets.user_id = users.id
  )`,
};

const mapUserStats = (row: any) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  imageUrl: row.imageUrl,
  role: row.role,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  passwordSet: Boolean(row.passwordSet),
  stats: {
    gallerySubmissions: Number(row.gallerySubmissionsCount ?? 0),
    galleryLikes: Number(row.galleryLikesCount ?? 0),
    blogPosts: Number(row.blogPostsCount ?? 0),
    blogComments: Number(row.blogCommentsCount ?? 0),
    products: Number(row.productsCount ?? 0),
    mediaAssets: Number(row.mediaAssetsCount ?? 0),
  },
});

export const listUsersWithStats = async ({
  search,
  role,
  limit,
  cursorId,
}: {
  search?: string;
  role?: "admin" | "guest";
  limit: number;
  cursorId?: string | null;
}) => {
  let cursor:
    | {
        id: string;
        createdAt: Date | null;
      }
    | null
    | undefined = null;

  if (cursorId) {
    cursor = await db.query.users.findFirst({
      where: eq(users.id, cursorId),
      columns: { id: true, createdAt: true },
    });
  }

  const filters = [];
  if (role) filters.push(eq(users.role, role));
  if (search?.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    filters.push(
      sql`(LOWER(${users.email}) LIKE ${term} OR LOWER(${users.name}) LIKE ${term})`
    );
  }

  const cursorClause = cursor
    ? or(
        lt(users.createdAt, cursor.createdAt ?? new Date(0)),
        and(
          eq(users.createdAt, cursor.createdAt ?? new Date(0)),
          lt(users.id, cursor.id)
        )
      )
    : undefined;

  const whereClause =
    filters.length || cursorClause ? and(...filters, cursorClause) : undefined;

  try {
    const items = await db
      .select(userStatsSelect)
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt), desc(users.id))
      .limit(limit);

    const nextCursor =
      items.length === limit ? items[items.length - 1].id : null;

    return {
      items: items.map(mapUserStats),
      nextCursor,
    };
  } catch (error) {
    console.error(
      "listUsersWithStats failed, falling back to basic list",
      error
    );
    const fallback = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        imageUrl: users.imageUrl,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt), desc(users.id))
      .limit(limit);

    const nextCursor =
      fallback.length === limit ? fallback[fallback.length - 1].id : null;

    return {
      items: fallback.map(row => ({
        ...row,
        stats: {
          gallerySubmissions: 0,
          galleryLikes: 0,
          blogPosts: 0,
          blogComments: 0,
          products: 0,
          mediaAssets: 0,
        },
      })),
      nextCursor,
    };
  }
};

export const getUserWithStats = async (id: string) => {
  const row = await db
    .select(userStatsSelect)
    .from(users)
    .where(eq(users.id, id));
  const user = row[0];
  if (!user) return null;
  return mapUserStats(user);
};

export const deleteUserWithCleanup = async (id: string) => {
  return db.transaction(async tx => {
    const likesBySubmission = await tx
      .select({
        submissionId: galleryLikes.submissionId,
        likeCount: sql<number>`count(*)`,
      })
      .from(galleryLikes)
      .where(eq(galleryLikes.userId, id))
      .groupBy(galleryLikes.submissionId);

    for (const entry of likesBySubmission) {
      await tx
        .update(gallerySubmissions)
        .set({
          likesCount: sql`GREATEST(${gallerySubmissions.likesCount} - ${entry.likeCount}, 0)`,
        })
        .where(eq(gallerySubmissions.id, entry.submissionId));
    }

    await tx.delete(galleryLikes).where(eq(galleryLikes.userId, id));

    const [user] = await tx.delete(users).where(eq(users.id, id)).returning({
      id: users.id,
      email: users.email,
      role: users.role,
    });

    if (!user) throw new Error(`User with id ${id} not found`);
    return user;
  });
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

export const deleteExpiredSessions = async () => {
  await db.delete(authSessions).where(lt(authSessions.expiresAt, new Date()));
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

export const createProductReview = async (
  data: typeof productReviews.$inferInsert
) => {
  const [review] = await db.insert(productReviews).values(data).returning();
  return review;
};

export const getAllProducts = async () => {
  return db.query.products.findMany({
    with: {
      user: true,
      reviews: {
        orderBy: (productReviews, { desc }) => [desc(productReviews.createdAt)],
      },
    },
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
      reviews: {
        orderBy: (productReviews, { desc }) => [desc(productReviews.createdAt)],
      },
    },
  });
};

export const getProductReviews = async (productId: string) => {
  return db.query.productReviews.findMany({
    where: eq(productReviews.productId, productId),
    orderBy: (productReviews, { desc }) => [desc(productReviews.createdAt)],
  });
};

export const updateProductReview = async (
  id: string,
  productId: string,
  data: Partial<typeof productReviews.$inferInsert>
) => {
  const [review] = await db
    .update(productReviews)
    .set(data)
    .where(
      and(eq(productReviews.id, id), eq(productReviews.productId, productId))
    )
    .returning();
  return review;
};

export const deleteProductReview = async (id: string, productId: string) => {
  const [deleted] = await db
    .delete(productReviews)
    .where(
      and(eq(productReviews.id, id), eq(productReviews.productId, productId))
    )
    .returning();
  return deleted;
};

export const getProductsByUserId = async (userId: string) => {
  return db.query.products.findMany({
    where: eq(products.userId, userId),
    with: {
      user: true,
      reviews: {
        orderBy: (productReviews, { desc }) => [desc(productReviews.createdAt)],
      },
    },
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

// PRE-LAUNCH RESERVATIONS
export type PreLaunchReservationStatus = "pending" | "contacted" | "completed";

export const createPreLaunchReservation = async (
  data: NewPreLaunchReservation
) => {
  const [reservation] = await db
    .insert(preLaunchReservations)
    .values(data)
    .returning();
  return reservation;
};

export const getPreLaunchReservationByDuplicateKey = async ({
  email,
  productId,
  productSize,
}: {
  email: string;
  productId: string;
  productSize: string;
}) => {
  return db.query.preLaunchReservations.findFirst({
    where: and(
      eq(preLaunchReservations.email, email),
      eq(preLaunchReservations.productId, productId),
      eq(preLaunchReservations.productSize, productSize)
    ),
    with: { product: true, user: true },
  });
};

export const getPreLaunchReservationById = async (id: string) => {
  return db.query.preLaunchReservations.findFirst({
    where: eq(preLaunchReservations.id, id),
    with: { product: true, user: true },
  });
};

export const claimPreLaunchReservationsForUser = async ({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) => {
  await db
    .update(preLaunchReservations)
    .set({ userId })
    .where(
      and(
        eq(preLaunchReservations.email, email),
        sql`${preLaunchReservations.userId} is null`
      )
    );
};

export const getPreLaunchReservationsForUser = async ({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) => {
  return db.query.preLaunchReservations.findMany({
    where: or(
      eq(preLaunchReservations.userId, userId),
      eq(preLaunchReservations.email, email)
    ),
    with: { product: true },
    orderBy: [desc(preLaunchReservations.createdAt)],
  });
};

export const listPreLaunchReservations = async ({
  productId,
  region,
  status,
  search,
  limit,
  cursorId,
}: {
  productId?: string;
  region?: string;
  status?: PreLaunchReservationStatus;
  search?: string;
  limit: number;
  cursorId?: string | null;
}) => {
  let cursor: { id: string; createdAt: Date | null } | null | undefined = null;

  if (cursorId) {
    cursor = await db.query.preLaunchReservations.findFirst({
      where: eq(preLaunchReservations.id, cursorId),
      columns: { id: true, createdAt: true },
    });
  }

  const filters = [];
  if (productId) filters.push(eq(preLaunchReservations.productId, productId));
  if (region) {
    filters.push(
      sql`LOWER(${preLaunchReservations.region}) = ${region.trim().toLowerCase()}`
    );
  }
  if (status) filters.push(eq(preLaunchReservations.status, status));
  if (search?.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    filters.push(
      sql`(
        LOWER(${preLaunchReservations.fullName}) LIKE ${term} OR
        LOWER(${preLaunchReservations.email}) LIKE ${term} OR
        LOWER(${preLaunchReservations.whatsapp}) LIKE ${term}
      )`
    );
  }

  const cursorClause = cursor
    ? or(
        lt(preLaunchReservations.createdAt, cursor.createdAt ?? new Date(0)),
        and(
          eq(preLaunchReservations.createdAt, cursor.createdAt ?? new Date(0)),
          lt(preLaunchReservations.id, cursor.id)
        )
      )
    : undefined;

  const whereClause =
    filters.length || cursorClause ? and(...filters, cursorClause) : undefined;

  const items = await db.query.preLaunchReservations.findMany({
    where: whereClause,
    with: { product: true, user: true },
    orderBy: [
      desc(preLaunchReservations.createdAt),
      desc(preLaunchReservations.id),
    ],
    limit,
  });

  const nextCursor = items.length === limit ? items[items.length - 1].id : null;
  return { items, nextCursor };
};

export const updatePreLaunchReservation = async (
  id: string,
  data: Partial<NewPreLaunchReservation>
) => {
  const [reservation] = await db
    .update(preLaunchReservations)
    .set(data)
    .where(eq(preLaunchReservations.id, id))
    .returning();
  return reservation;
};

export const deletePreLaunchReservation = async (id: string) => {
  const [reservation] = await db
    .delete(preLaunchReservations)
    .where(eq(preLaunchReservations.id, id))
    .returning();
  return reservation;
};

// WORLD CUP CAMPAIGN
export const WORLD_CUP_FIRST_MATCH_DEADLINE = new Date("2026-07-14T18:55:00.000Z");
export const WORLD_CUP_CAMPAIGN_DEADLINE = new Date("2026-07-15T18:55:00.000Z");

export type WorldCupWinnerStatus =
  | "PENDING"
  | "FIRST"
  | "SECOND"
  | "THIRD"
  | "DISCOUNT"
  | "NOT_WINNER";
export type WorldCupFinalStatus = "COMING_SOON" | "OPEN" | "CLOSED" | "RESULTS";
export type WorldCupFinalChampion = "TEAM_A" | "TEAM_B";
export type WorldCupLotteryCriterion =
  | "ALL_VALID"
  | "CORRECT_ONLY"
  | "NON_PRIZE";

const getCampaignSecret = () =>
  process.env.WORLD_CUP_CAMPAIGN_SECRET ||
  ENV.DATABASE_URL ||
  "rayhana-world-cup-campaign";

export const makeWorldCupPredictionReferenceCode = (prediction: {
  id: string;
  email: string;
}) =>
  createHmac("sha256", getCampaignSecret())
    .update(`${prediction.id}:${prediction.email.toLowerCase()}`)
    .digest("hex")
    .slice(0, 10)
    .toUpperCase();

export const createWorldCupPrediction = async (data: NewWorldCupPrediction) => {
  const [prediction] = await db
    .insert(worldCupPredictions)
    .values(data)
    .returning();
  return prediction;
};

export const getWorldCupPredictionByEmail = async (email: string) => {
  return db.query.worldCupPredictions.findFirst({
    where: eq(worldCupPredictions.email, email),
  });
};

export const listWorldCupPredictions = async () => {
  return db
    .select()
    .from(worldCupPredictions)
    .orderBy(desc(worldCupPredictions.createdAt));
};

export const listWorldCupPredictionChoices = async () => {
  return db
    .select({
      franceSpainAdvances: worldCupPredictions.franceSpainAdvances,
      englandArgentinaAdvances: worldCupPredictions.englandArgentinaAdvances,
    })
    .from(worldCupPredictions);
};

export const updateWorldCupPredictionWinnerStatus = async (
  id: string,
  winnerStatus: WorldCupWinnerStatus
) => {
  const [prediction] = await db
    .update(worldCupPredictions)
    .set({ winnerStatus })
    .where(eq(worldCupPredictions.id, id))
    .returning();
  return prediction;
};

export const deleteAllWorldCupPredictions = async () => {
  const deleted = await db.delete(worldCupPredictions).returning({
    id: worldCupPredictions.id,
  });
  return { deletedCount: deleted.length };
};

export const getWorldCupCampaignSettings = async () => {
  return db.query.worldCupCampaignSettings.findFirst({
    where: eq(worldCupCampaignSettings.id, 1),
  });
};

export const saveWorldCupCampaignSettings = async (
  data: Omit<NewWorldCupCampaignSettings, "id" | "createdAt" | "updatedAt">
) => {
  const [settings] = await db
    .insert(worldCupCampaignSettings)
    .values({ id: 1, ...data })
    .onConflictDoUpdate({
      target: worldCupCampaignSettings.id,
      set: data,
    })
    .returning();
  return settings;
};

export const submitWorldCupFinalPrediction = async (input: {
  email: string;
  referenceCode: string;
  teamAScore: number;
  teamBScore: number;
  champion: WorldCupFinalChampion;
}) => {
  const settings = await getWorldCupCampaignSettings();
  if (!settings || settings.finalStatus !== "OPEN") {
    throw new Error("FINAL_NOT_OPEN");
  }
  if (
    settings.finalDeadline &&
    settings.finalDeadline.getTime() <= Date.now()
  ) {
    throw new Error("FINAL_CLOSED");
  }

  const participant = await getWorldCupPredictionByEmail(
    input.email.toLowerCase()
  );
  if (
    !participant ||
    makeWorldCupPredictionReferenceCode(participant) !==
      input.referenceCode.trim().toUpperCase()
  ) {
    throw new Error("INVALID_REFERENCE");
  }

  const [finalPrediction] = await db
    .insert(worldCupFinalPredictions)
    .values({
      predictionId: participant.id,
      teamAScore: input.teamAScore,
      teamBScore: input.teamBScore,
      champion: input.champion,
    })
    .onConflictDoUpdate({
      target: worldCupFinalPredictions.predictionId,
      set: {
        teamAScore: input.teamAScore,
        teamBScore: input.teamBScore,
        champion: input.champion,
      },
    })
    .returning();

  return {
    success: true as const,
    participantName: participant.fullName,
    finalPrediction,
  };
};

export const listWorldCupFinalPredictions = async () => {
  return db
    .select({
      id: worldCupFinalPredictions.id,
      predictionId: worldCupFinalPredictions.predictionId,
      fullName: worldCupPredictions.fullName,
      email: worldCupPredictions.email,
      teamAScore: worldCupFinalPredictions.teamAScore,
      teamBScore: worldCupFinalPredictions.teamBScore,
      champion: worldCupFinalPredictions.champion,
      createdAt: worldCupFinalPredictions.createdAt,
    })
    .from(worldCupFinalPredictions)
    .innerJoin(
      worldCupPredictions,
      eq(worldCupFinalPredictions.predictionId, worldCupPredictions.id)
    )
    .orderBy(desc(worldCupFinalPredictions.createdAt));
};

type WorldCupSemiFinalOneTeam = "FRANCE" | "SPAIN";
type WorldCupSemiFinalTwoTeam = "ENGLAND" | "ARGENTINA";
type WorldCupTeamCode = WorldCupSemiFinalOneTeam | WorldCupSemiFinalTwoTeam;

const teamNameAliases: Record<WorldCupTeamCode, string[]> = {
  FRANCE: ["france", "فرانسه"],
  SPAIN: ["spain", "اسپانیا", "هسپانیه"],
  ENGLAND: ["england", "انگلستان", "انګلستان"],
  ARGENTINA: ["argentina", "آرژانتین", "ارجنټاین"],
};

const normalizeWorldCupTeamName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u064b-\u065f\u0670\u200c\s._-]/g, "");

const resolveWorldCupTeamCode = (value?: string | null) => {
  if (!value) return null;
  const normalized = normalizeWorldCupTeamName(value);
  for (const [code, aliases] of Object.entries(teamNameAliases)) {
    if (
      aliases.some(alias => normalizeWorldCupTeamName(alias) === normalized)
    ) {
      return code as WorldCupTeamCode;
    }
  }
  return null;
};

export const getWorldCupEligibleLotteryPool = async (
  criterion: WorldCupLotteryCriterion
) => {
  const participants = await db
    .select()
    .from(worldCupPredictions)
    .orderBy(worldCupPredictions.createdAt);

  if (criterion === "ALL_VALID") return participants;
  if (criterion === "NON_PRIZE") {
    return participants.filter(
      item => !["FIRST", "SECOND", "THIRD"].includes(item.winnerStatus)
    );
  }

  const settings = await getWorldCupCampaignSettings();
  if (
    !settings ||
    settings.finalStatus !== "RESULTS" ||
    !settings.finalTeamA ||
    !settings.finalTeamB ||
    !settings.finalChampion
  ) {
    return [];
  }

  const finalistA = resolveWorldCupTeamCode(settings.finalTeamA);
  const finalistB = resolveWorldCupTeamCode(settings.finalTeamB);
  const semifinalOneWinner = [finalistA, finalistB].find(
    (team): team is WorldCupSemiFinalOneTeam =>
      team === "FRANCE" || team === "SPAIN"
  );
  const semifinalTwoWinner = [finalistA, finalistB].find(
    (team): team is WorldCupSemiFinalTwoTeam =>
      team === "ENGLAND" || team === "ARGENTINA"
  );
  if (!semifinalOneWinner || !semifinalTwoWinner) return [];

  const finals = await db.select().from(worldCupFinalPredictions);
  const correctIds = new Set(
    finals
      .filter(item => item.champion === settings.finalChampion)
      .map(item => item.predictionId)
  );
  return participants.filter(
    item =>
      item.franceSpainAdvances === semifinalOneWinner &&
      item.englandArgentinaAdvances === semifinalTwoWinner &&
      correctIds.has(item.id)
  );
};

export const executeWorldCupLotteryDraw = async (input: {
  criterion: WorldCupLotteryCriterion;
  winnerCount: number;
  executedBy: string;
}) => {
  const pool = await getWorldCupEligibleLotteryPool(input.criterion);
  if (pool.length === 0) throw new Error("NO_ELIGIBLE_PARTICIPANTS");
  if (input.winnerCount > pool.length) throw new Error("WINNER_COUNT_TOO_HIGH");

  const eligibleIds = pool.map(item => item.id).sort();
  const eligibleSnapshot = JSON.stringify(eligibleIds);
  const auditSeed = randomBytes(32).toString("hex");
  const selected = eligibleIds
    .map(id => ({
      id,
      rank: createHash("sha256").update(`${auditSeed}:${id}`).digest("hex"),
    }))
    .sort((a, b) => a.rank.localeCompare(b.rank))
    .slice(0, input.winnerCount);
  const auditHash = createHash("sha256")
    .update(
      `${input.criterion}|${input.winnerCount}|${eligibleSnapshot}|${auditSeed}`
    )
    .digest("hex");

  return db.transaction(async tx => {
    const [draw] = await tx
      .insert(worldCupLotteryDraws)
      .values({
        criterion: input.criterion,
        winnerCount: input.winnerCount,
        eligibleCount: eligibleIds.length,
        eligibleSnapshot,
        auditSeed,
        auditHash,
        executedBy: input.executedBy,
      })
      .returning();

    await tx.insert(worldCupLotteryWinners).values(
      selected.map((winner, index) => ({
        drawId: draw.id,
        predictionId: winner.id,
        position: index + 1,
      }))
    );

    return { drawId: draw.id, eligibleCount: eligibleIds.length, auditHash };
  });
};

export const listWorldCupLotteryDraws = async () => {
  const draws = await db
    .select()
    .from(worldCupLotteryDraws)
    .orderBy(desc(worldCupLotteryDraws.executedAt));

  return Promise.all(
    draws.map(async draw => ({
      ...draw,
      winners: await db
        .select({
          position: worldCupLotteryWinners.position,
          predictionId: worldCupPredictions.id,
          fullName: worldCupPredictions.fullName,
          email: worldCupPredictions.email,
          country: worldCupPredictions.country,
        })
        .from(worldCupLotteryWinners)
        .innerJoin(
          worldCupPredictions,
          eq(worldCupLotteryWinners.predictionId, worldCupPredictions.id)
        )
        .where(eq(worldCupLotteryWinners.drawId, draw.id))
        .orderBy(worldCupLotteryWinners.position),
    }))
  );
};

export const publishWorldCupLotteryDraw = async (
  drawId: string,
  published: boolean
) => {
  const [draw] = await db
    .update(worldCupLotteryDraws)
    .set({ published })
    .where(eq(worldCupLotteryDraws.id, drawId))
    .returning();
  return draw;
};

const maskCampaignName = (name: string) => {
  const trimmed = name.trim();
  if (trimmed.length <= 2) return `${trimmed[0] ?? "*"}**`;
  return `${trimmed.slice(0, 1)}${"*".repeat(
    Math.max(2, trimmed.length - 2)
  )}${trimmed.slice(-1)}`;
};

export const getPublicWorldCupLotteryWinners = async () => {
  const settings = await getWorldCupCampaignSettings();
  if (!settings?.publicWinnersVisible) return [];
  const draws = await listWorldCupLotteryDraws();
  return draws
    .filter(draw => draw.published)
    .map(draw => ({
      id: draw.id,
      executedAt: draw.executedAt,
      winners: draw.winners.map(winner => ({
        position: winner.position,
        name: maskCampaignName(winner.fullName),
        country: winner.country,
      })),
    }));
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
  search?: string;
};

export const getBlogPostsPaginated = async (filters: BlogListFilters = {}) => {
  const includeDrafts = Boolean(filters.includeDrafts);
  const featured = filters.featured;
  const status = filters.status;
  const page = Math.max(1, Number(filters.page || 1));
  const limit = Math.max(1, Math.min(50, Number(filters.limit || 9)));
  const offset = (page - 1) * limit;
  const searchTerm = filters.search?.trim().toLowerCase();

  const whereClauses = [
    !includeDrafts ? eq(blogPosts.status, "published") : undefined,
    status ? eq(blogPosts.status, status) : undefined,
    featured !== undefined ? eq(blogPosts.featured, featured) : undefined,
    searchTerm
      ? sql`(
          lower(${blogPosts.slug}) like ${"%" + searchTerm + "%"} or
          exists (
            select 1 from jsonb_each_text(${blogPosts.title}) as t(k, v)
            where lower(v) like ${"%" + searchTerm + "%"}
          ) or
          exists (
            select 1 from jsonb_each_text(${blogPosts.excerpt}) as t2(k, v)
            where lower(v) like ${"%" + searchTerm + "%"}
          )
        )`
      : undefined,
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
  const result = await db.insert(blogComments).values(data).returning();
  const comment = Array.isArray(result) ? result[0] : undefined;
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

  const updated = await db
    .update(blogComments)
    .set(data)
    .where(eq(blogComments.id, id))
    .returning();
  const comment = Array.isArray(updated) ? updated[0] : undefined;
  return comment;
};

export const deleteBlogComment = async (id: string) => {
  const existingComment = await getBlogCommentById(id);
  if (!existingComment) {
    throw new Error(`Blog comment with id ${id} not found`);
  }

  const deleted = await db
    .delete(blogComments)
    .where(eq(blogComments.id, id))
    .returning();
  const comment = Array.isArray(deleted) ? deleted[0] : undefined;
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

export const getBlogCommentsByBlogId = async (
  blogId: string,
  { includeUnapproved = false }: { includeUnapproved?: boolean } = {}
) => {
  return db.query.blogComments.findMany({
    where: and(
      eq(blogComments.blogId, blogId),
      includeUnapproved ? undefined : eq(blogComments.approved, true)
    ),
    with: { user: true },
    orderBy: (blogComments, { desc }) => [desc(blogComments.createdAt)],
  });
};

export const approveBlogComment = async (id: string) => {
  const [row] = await db
    .update(blogComments)
    .set({ approved: true })
    .where(eq(blogComments.id, id))
    .returning();
  return row;
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

// Aggregated homepage payload (minimal fields, limited rows)
export const getHomepageBundle = async () => {
  const [seo, home, settings, contact, faq] = await Promise.all([
    getSiteContentByKey("seo"),
    getSiteContentByKey("home"),
    getSiteContentByKey("settings"),
    getSiteContentByKey("contact"),
    getSiteContentByKey("faq"),
  ]);

  const blogs = await db.query.blogPosts.findMany({
    where: and(eq(blogPosts.status, "published"), eq(blogPosts.featured, true)),
    columns: {
      id: true,
      title: true,
      slug: true,
      imageUrl: true,
      excerpt: true,
      publishedAt: true,
    },
    orderBy: [desc(blogPosts.publishedAt)],
    limit: 4,
  });

  const gallery = await db.query.gallerySubmissions.findMany({
    where: eq(gallerySubmissions.status, "approved"),
    columns: {
      id: true,
      imageUrl: true,
      // title/description are stored in site content, so keep payload lean here
    },
    orderBy: [desc(gallerySubmissions.createdAt)],
    limit: 4,
  });

  return {
    seo: seo?.data ?? {},
    home: home?.data ?? {},
    settings: settings?.data ?? {},
    contact: contact?.data ?? {},
    faq: faq?.data ?? {},
    blogs,
    gallery,
  };
};

// MEDIA QUERIES
export const createMediaAsset = async (data: NewMediaAsset) => {
  const [asset] = await db.insert(mediaAssets).values(data).returning();
  return asset;
};

export const getMediaAssetById = async (id: string) => {
  return db.query.mediaAssets.findFirst({ where: eq(mediaAssets.id, id) });
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
