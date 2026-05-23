import { pgTable, foreignKey, unique, uuid, text, jsonb, boolean, timestamp, integer, uniqueIndex, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const blogStatus = pgEnum("blog_status", ['draft', 'published'])
export const contactStatus = pgEnum("contact_status", ['new', 'resolved'])
export const galleryStatus = pgEnum("gallery_status", ['pending', 'approved', 'rejected'])
export const userRole = pgEnum("user_role", ['admin', 'guest'])


export const blogPosts = pgTable("blog_posts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	slug: text().notNull(),
	title: jsonb().notNull(),
	excerpt: jsonb().notNull(),
	content: jsonb().notNull(),
	imageUrl: text("image_url").notNull(),
	authorName: text("author_name"),
	featured: boolean().default(false).notNull(),
	status: blogStatus().default('published').notNull(),
	userId: text("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	publishedAt: timestamp("published_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "blog_posts_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("blog_posts_slug_unique").on(table.slug),
]);

export const comments = pgTable("comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	content: text().notNull(),
	userId: text("user_id").notNull(),
	productId: uuid("product_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "comments_product_id_products_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "comments_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const emailVerificationTokens = pgTable("email_verification_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	tokenHash: text("token_hash").notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	used: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "email_verification_tokens_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const gallerySubmissions = pgTable("gallery_submissions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	imageUrl: text("image_url").notNull(),
	dishName: text("dish_name").notNull(),
	description: text(),
	status: galleryStatus().default('pending').notNull(),
	userId: text("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	likesCount: integer("likes_count").default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "gallery_submissions_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const contactMessages = pgTable("contact_messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	subject: text(),
	message: text().notNull(),
	status: contactStatus().default('new').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const galleryLikes = pgTable("gallery_likes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	submissionId: uuid("submission_id").notNull(),
	userId: text("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("gallery_like_unique").using("btree", table.submissionId.asc().nullsLast().op("text_ops"), table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.submissionId],
			foreignColumns: [gallerySubmissions.id],
			name: "gallery_likes_submission_id_gallery_submissions_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "gallery_likes_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const mediaAssets = pgTable("media_assets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	url: text().notNull(),
	fileName: text("file_name").notNull(),
	mimeType: text("mime_type").notNull(),
	sizeBytes: integer("size_bytes").notNull(),
	width: integer(),
	height: integer(),
	altText: text("alt_text"),
	userId: text("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "media_assets_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const oauthAccounts = pgTable("oauth_accounts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	provider: text().notNull(),
	providerUserId: text("provider_user_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("oauth_provider_user_unique").using("btree", table.provider.asc().nullsLast().op("text_ops"), table.providerUserId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "oauth_accounts_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	tokenHash: text("token_hash").notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	used: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "password_reset_tokens_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	country: text(),
	ip: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("newsletter_subscriptions_email_unique").on(table.email),
]);

export const productReviews = pgTable("product_reviews", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	author: text().notNull(),
	text: jsonb().notNull(),
	rating: integer().default(5).notNull(),
	verified: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_reviews_product_id_products_id_fk"
		}).onDelete("cascade"),
]);

export const authSessions = pgTable("auth_sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	tokenHash: text("token_hash").notNull(),
	userAgent: text("user_agent"),
	ip: text(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	revoked: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "auth_sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const siteContent = pgTable("site_content", {
	key: text().primaryKey().notNull(),
	data: jsonb().default({}).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	name: text(),
	imageUrl: text("image_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	role: userRole().default('guest').notNull(),
	passwordHash: text("password_hash"),
	emailVerifiedAt: timestamp("email_verified_at", { mode: 'string' }),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const blogComments = pgTable("blog_comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	content: text().notNull(),
	userId: text("user_id").notNull(),
	blogId: uuid("blog_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	approved: boolean().default(false).notNull(),
	parentId: uuid("parent_id"),
}, (table) => [
	foreignKey({
			columns: [table.blogId],
			foreignColumns: [blogPosts.id],
			name: "blog_comments_blog_id_blog_posts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "blog_comments_parent_id_blog_comments_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "blog_comments_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: jsonb().notNull(),
	description: jsonb().notNull(),
	imageUrl: text("image_url").notNull(),
	userId: text("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	category: text().notNull(),
	rating: integer().default(5).notNull(),
	sizes: jsonb().default([]).notNull(),
	colors: jsonb().default([]).notNull(),
	prices: jsonb().default({}).notNull(),
	productUrl: text("product_url"),
	amazonCaUrl: text("amazon_ca_url"),
	amazonAuUrl: text("amazon_au_url"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "products_user_id_users_id_fk"
		}).onDelete("cascade"),
]);
