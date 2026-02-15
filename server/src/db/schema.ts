// import { pgTable, text,jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  pgEnum,
  uniqueIndex,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["admin", "guest"]);
export const galleryStatusEnum = pgEnum("gallery_status", [
  "pending",
  "approved",
  "rejected",
]);

export const contactStatusEnum = pgEnum("contact_status", ["new", "resolved"]);

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  country: text("country"),
  ip: text("ip"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const blogStatusEnum = pgEnum("blog_status", ["draft", "published"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(), // clerkId
  email: text("email").notNull().unique(),
  name: text("name"),
  imageUrl: text("image_url"),
  passwordHash: text("password_hash"),
  emailVerifiedAt: timestamp("email_verified_at", { mode: "date" }),
  role: userRoleEnum("role").notNull().default("guest"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  // updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const authSessions = pgTable("auth_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  userAgent: text("user_agent"),
  ip: text("ip"),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  revoked: boolean("revoked").notNull().default(false),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const oauthAccounts = pgTable("oauth_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: text("provider").notNull(), // e.g., google, facebook
  providerUserId: text("provider_user_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, table => ({
  providerUserUnique: uniqueIndex("oauth_provider_user_unique").on(
    table.provider,
    table.providerUserId
  ),
}));

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Localized fields: { en: string, fa: string, ps: string }
  title: jsonb("title").$type<Record<string, string>>().notNull(),
  description: jsonb("description").$type<Record<string, string>>().notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  productUrl: text("product_url"),
  rating: integer("rating").notNull().default(5),
  sizes: jsonb("sizes").$type<number[]>().notNull().default([]),
  colors: jsonb("colors").$type<string[]>().notNull().default([]),
  // Size -> price mapping, e.g. { "7": 24.99, "9": 29.99 }
  prices: jsonb("prices").$type<Record<string, number>>().notNull().default({}),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: jsonb("title").$type<Record<string, string>>().notNull(),
  excerpt: jsonb("excerpt").$type<Record<string, string>>().notNull(),
  content: jsonb("content").$type<Record<string, string>>().notNull(),
  imageUrl: text("image_url").notNull(),
  authorName: text("author_name"),
  featured: boolean("featured").notNull().default(false),
  status: blogStatusEnum("status").notNull().default("published"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  publishedAt: timestamp("published_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

export const blogComments = pgTable("blog_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  blogId: uuid("blog_id")
    .notNull()
    .references(() => blogPosts.id, { onDelete: "cascade" }),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const siteContent = pgTable("site_content", {
  key: text("key").primaryKey(),
  data: jsonb("data").$type<Record<string, any>>().notNull().default({}),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  width: integer("width"),
  height: integer("height"),
  altText: text("alt_text"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  status: contactStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const gallerySubmissions = pgTable("gallery_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  imageUrl: text("image_url").notNull(),
  dishName: text("dish_name").notNull(),
  description: text("description"),
  status: galleryStatusEnum("status").notNull().default("pending"),
  likesCount: integer("likes_count").notNull().default(0),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const galleryLikes = pgTable(
  "gallery_likes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => gallerySubmissions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  table => ({
    uniqueSubmissionUser: uniqueIndex("gallery_like_unique").on(
      table.submissionId,
      table.userId
    ),
  })
);

// 🔴 Relations define how tables connect to each other. This enables Drizzle's query API
// 🔴 to automatically join related data when using `with: { relationName: true }`

// 🔴 Users Relations: A user can have many products and many comments
// 🔴 `many()` means one user can have multiple related records

export const usersRelations = relations(users, ({ many }) => ({
  products: many(products), // 🔴 One user → many products
  comments: many(comments), // 🔴 One user → many comments
  blogPosts: many(blogPosts),
  blogComments: many(blogComments),
  mediaAssets: many(mediaAssets),
  gallerySubmissions: many(gallerySubmissions),
}));

// Products Relations: a product belongs to one user and can have many comments
// `one()` means a single related record, `many()` means multiple related records

export const productsRelations = relations(products, ({ one, many }) => ({
  comments: many(comments),
  // `fields` = the foreign key column in THIS table (products.userId)
  // `references` = the primary key column in the RELATED table (users.id)
  user: one(users, { fields: [products.userId], references: [users.id] }), // one product → one user
}));

// Comments Relations: A comment belongs to one user and one product
export const commentsRelations = relations(comments, ({ one }) => ({
  // `comments.userId` is the foreign key,  `users.id` is the primary key
  user: one(users, { fields: [comments.userId], references: [users.id] }), // One comment → one user
  // `comments.productId` is the foreign key,  `products.id` is the primary key
  product: one(products, {
    fields: [comments.productId],
    references: [products.id],
  }), // One comment → one product
}));

export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  user: one(users, { fields: [blogPosts.userId], references: [users.id] }),
  comments: many(blogComments),
}));

export const blogCommentsRelations = relations(blogComments, ({ one }) => ({
  user: one(users, { fields: [blogComments.userId], references: [users.id] }),
  blog: one(blogPosts, {
    fields: [blogComments.blogId],
    references: [blogPosts.id],
  }),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one }) => ({
  user: one(users, { fields: [mediaAssets.userId], references: [users.id] }),
}));

export const gallerySubmissionsRelations = relations(
  gallerySubmissions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [gallerySubmissions.userId],
      references: [users.id],
    }),
    likes: many(galleryLikes),
  })
);

export const galleryLikesRelations = relations(galleryLikes, ({ one }) => ({
  submission: one(gallerySubmissions, {
    fields: [galleryLikes.submissionId],
    references: [gallerySubmissions.id],
  }),
  user: one(users, {
    fields: [galleryLikes.userId],
    references: [users.id],
  }),
}));

// Type inference
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;

export type BlogComment = typeof blogComments.$inferSelect;
export type NewBlogComment = typeof blogComments.$inferInsert;

export type SiteContent = typeof siteContent.$inferSelect;
export type NewSiteContent = typeof siteContent.$inferInsert;

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NewMediaAsset = typeof mediaAssets.$inferInsert;

export type GallerySubmission = typeof gallerySubmissions.$inferSelect;
export type NewGallerySubmission = typeof gallerySubmissions.$inferInsert;

export type GalleryLike = typeof galleryLikes.$inferSelect;
export type NewGalleryLike = typeof galleryLikes.$inferInsert;

export type NewsletterSubscription =
  typeof newsletterSubscriptions.$inferSelect;
export type NewNewsletterSubscription =
  typeof newsletterSubscriptions.$inferInsert;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;

export type AuthSession = typeof authSessions.$inferSelect;
export type NewAuthSession = typeof authSessions.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export type EmailVerificationToken =
  typeof emailVerificationTokens.$inferSelect;
export type NewEmailVerificationToken =
  typeof emailVerificationTokens.$inferInsert;

export type OauthAccount = typeof oauthAccounts.$inferSelect;
export type NewOauthAccount = typeof oauthAccounts.$inferInsert;
