import { relations } from "drizzle-orm/relations";
import { users, blogPosts, products, comments, emailVerificationTokens, gallerySubmissions, galleryLikes, mediaAssets, oauthAccounts, passwordResetTokens, productReviews, authSessions, blogComments } from "./schema";

export const blogPostsRelations = relations(blogPosts, ({one, many}) => ({
	user: one(users, {
		fields: [blogPosts.userId],
		references: [users.id]
	}),
	blogComments: many(blogComments),
}));

export const usersRelations = relations(users, ({many}) => ({
	blogPosts: many(blogPosts),
	comments: many(comments),
	emailVerificationTokens: many(emailVerificationTokens),
	gallerySubmissions: many(gallerySubmissions),
	galleryLikes: many(galleryLikes),
	mediaAssets: many(mediaAssets),
	oauthAccounts: many(oauthAccounts),
	passwordResetTokens: many(passwordResetTokens),
	authSessions: many(authSessions),
	blogComments: many(blogComments),
	products: many(products),
}));

export const commentsRelations = relations(comments, ({one}) => ({
	product: one(products, {
		fields: [comments.productId],
		references: [products.id]
	}),
	user: one(users, {
		fields: [comments.userId],
		references: [users.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	comments: many(comments),
	productReviews: many(productReviews),
	user: one(users, {
		fields: [products.userId],
		references: [users.id]
	}),
}));

export const emailVerificationTokensRelations = relations(emailVerificationTokens, ({one}) => ({
	user: one(users, {
		fields: [emailVerificationTokens.userId],
		references: [users.id]
	}),
}));

export const gallerySubmissionsRelations = relations(gallerySubmissions, ({one, many}) => ({
	user: one(users, {
		fields: [gallerySubmissions.userId],
		references: [users.id]
	}),
	galleryLikes: many(galleryLikes),
}));

export const galleryLikesRelations = relations(galleryLikes, ({one}) => ({
	gallerySubmission: one(gallerySubmissions, {
		fields: [galleryLikes.submissionId],
		references: [gallerySubmissions.id]
	}),
	user: one(users, {
		fields: [galleryLikes.userId],
		references: [users.id]
	}),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({one}) => ({
	user: one(users, {
		fields: [mediaAssets.userId],
		references: [users.id]
	}),
}));

export const oauthAccountsRelations = relations(oauthAccounts, ({one}) => ({
	user: one(users, {
		fields: [oauthAccounts.userId],
		references: [users.id]
	}),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({one}) => ({
	user: one(users, {
		fields: [passwordResetTokens.userId],
		references: [users.id]
	}),
}));

export const productReviewsRelations = relations(productReviews, ({one}) => ({
	product: one(products, {
		fields: [productReviews.productId],
		references: [products.id]
	}),
}));

export const authSessionsRelations = relations(authSessions, ({one}) => ({
	user: one(users, {
		fields: [authSessions.userId],
		references: [users.id]
	}),
}));

export const blogCommentsRelations = relations(blogComments, ({one, many}) => ({
	blogPost: one(blogPosts, {
		fields: [blogComments.blogId],
		references: [blogPosts.id]
	}),
	blogComment: one(blogComments, {
		fields: [blogComments.parentId],
		references: [blogComments.id],
		relationName: "blogComments_parentId_blogComments_id"
	}),
	blogComments: many(blogComments, {
		relationName: "blogComments_parentId_blogComments_id"
	}),
	user: one(users, {
		fields: [blogComments.userId],
		references: [users.id]
	}),
}));