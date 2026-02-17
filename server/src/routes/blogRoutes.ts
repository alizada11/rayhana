import { Router, type RequestHandler } from "express";
import { requireAuth } from "../lib/auth";
import rateLimit from "express-rate-limit";
import { upload } from "../middleware/upload";
import { requireAdmin } from "../middleware/requireAdmin";
import * as blogController from "../controllers/blogController";
import * as blogCommentController from "../controllers/blogCommentController";

const router = Router();

const commentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
}) as unknown as RequestHandler;

// GET /api/blogs => Get all blog posts (public)
router.get("/", blogController.getAllBlogPosts);

// Admin: all comments (must be before slug routes)
router.get(
  "/admin/comments",
  requireAuth(),
  requireAdmin,
  blogCommentController.listAllComments
);

// POST /api/blogs/uploads => Upload blog content image (admin only)
router.post(
  "/uploads",
  requireAuth(),
  requireAdmin,
  upload.single("image"),
  blogController.uploadBlogImage
);

// GET /api/blogs/:slug => Get blog post by slug (public)
router.get("/:slug", blogController.getBlogPostBySlug);

// POST /api/blogs => Create blog post (admin only)
router.post(
  "/",
  requireAuth(),
  requireAdmin,
  upload.single("image"),
  blogController.createBlogPost
);

// PUT /api/blogs/:id => Update blog post (admin only)
router.put(
  "/:id",
  requireAuth(),
  requireAdmin,
  upload.single("image"),
  blogController.updateBlogPost
);

// DELETE /api/blogs/:id => Delete blog post (admin only)
router.delete(
  "/:id",
  requireAuth(),
  requireAdmin,
  blogController.deleteBlogPost
);

// GET /api/blogs/:id/comments => Get blog comments (public)
router.get("/:id/comments", blogCommentController.getBlogComments);

// POST /api/blogs/:id/comments => Create blog comment (auth)
router.post(
  "/:id/comments",
  commentLimiter,
  requireAuth(),
  blogCommentController.createBlogComment
);
// POST /api/blogs/:id/comments/:parentId/replies => reply (auth)
router.post(
  "/:id/comments/:parentId/replies",
  commentLimiter,
  requireAuth(),
  blogCommentController.createBlogComment
);

// Approve comment (admin)
router.patch(
  "/:id/comments/:commentId/approve",
  requireAuth(),
  requireAdmin,
  blogCommentController.approveBlogComment
);

// PUT /api/blogs/:id/comments/:commentId => Update blog comment (owner/admin)
router.put(
  "/:id/comments/:commentId",
  requireAuth(),
  blogCommentController.updateBlogComment
);

// DELETE /api/blogs/:id/comments/:commentId => Delete blog comment (owner/admin)
router.delete(
  "/:id/comments/:commentId",
  requireAuth(),
  blogCommentController.deleteBlogComment
);

export default router;
