import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

const getId = (rawId: string | string[]) =>
  Array.isArray(rawId) ? rawId[0] : rawId;

const isAdminUser = async (userId: string) => {
  const user = await queries.getUserById(userId);
  return user?.role === "admin";
};

// -------------------------
// GET COMMENTS FOR BLOG (public)
// -------------------------
export const getBlogComments = async (req: Request, res: Response) => {
  try {
    const blogId = getId(req.params.id);
    const blog = await queries.getBlogPostById(blogId);
    if (!blog) return res.status(404).json({ error: "Blog post not found" });
    const { userId } = getAuth(req);
    const isAdmin = userId ? await isAdminUser(userId) : false;
    if (!isAdmin && blog.status !== "published") {
      return res.status(404).json({ error: "Blog post not found" });
    }

    const comments = await queries.getBlogCommentsByBlogId(blogId);
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error getting blog comments:", error);
    res.status(500).json({ error: "Failed to get blog comments" });
  }
};

// -------------------------
// CREATE COMMENT (auth)
// -------------------------
export const createBlogComment = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const blogId = getId(req.params.id);
    const { content } = req.body;

    if (!content)
      return res.status(400).json({ error: "Comment content is required" });

    const blog = await queries.getBlogPostById(blogId);
    if (!blog) return res.status(404).json({ error: "Blog post not found" });
    const isAdmin = await isAdminUser(userId);
    if (!isAdmin && blog.status !== "published") {
      return res.status(403).json({ error: "Comments are disabled" });
    }

    const comment = await queries.createBlogComment({
      content,
      userId,
      blogId,
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating blog comment:", error);
    res.status(500).json({ error: "Failed to create blog comment" });
  }
};

// -------------------------
// UPDATE COMMENT (owner or admin)
// -------------------------
export const updateBlogComment = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const blogId = getId(req.params.id);
    const commentId = getId(req.params.commentId);
    const { content } = req.body;

    if (!content)
      return res.status(400).json({ error: "Comment content is required" });

    const existing = await queries.getBlogCommentById(commentId);
    if (!existing || existing.blogId !== blogId) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const isAdmin = await isAdminUser(userId);
    if (!isAdmin && existing.userId !== userId) {
      return res
        .status(403)
        .json({ error: "You can only update your own comments" });
    }

    const updated = await queries.updateBlogComment(commentId, { content });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating blog comment:", error);
    res.status(500).json({ error: "Failed to update blog comment" });
  }
};

// -------------------------
// DELETE COMMENT (owner or admin)
// -------------------------
export const deleteBlogComment = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const blogId = getId(req.params.id);
    const commentId = getId(req.params.commentId);

    const existing = await queries.getBlogCommentById(commentId);
    if (!existing || existing.blogId !== blogId) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const isAdmin = await isAdminUser(userId);
    if (!isAdmin && existing.userId !== userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own comments" });
    }

    await queries.deleteBlogComment(commentId);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog comment:", error);
    res.status(500).json({ error: "Failed to delete blog comment" });
  }
};

// Admin: list all comments paginated
export const listAllComments = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const isAdmin = await isAdminUser(userId);
    if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

    const { limit = 20, cursor } = req.query;
    const pageSize = Math.min(Number(limit) || 20, 100);
    const result = await queries.getAllBlogCommentsPaged({
      limit: pageSize,
      cursorId: cursor ? String(cursor) : undefined,
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error listing comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};
