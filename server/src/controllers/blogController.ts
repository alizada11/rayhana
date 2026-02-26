import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "../lib/auth";
import fs from "fs";
import { getUploadsDir, resolveUploadUrlToPath } from "../lib/paths";
import path from "path";
const asQueryString = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
};

const getId = (rawId: string | string[]) =>
  Array.isArray(rawId) ? rawId[0] : rawId;

const parseJSON = <T>(value: unknown, fallback: T): T => {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const isValidStatus = (status?: string) =>
  status === undefined || status === "draft" || status === "published";

const isAdminUser = async (userId: string) => {
  const user = await queries.getUserById(userId);
  return user?.role === "admin";
};

const safeUnlinkUpload = (url?: string) => {
  if (!url || !url.startsWith("/uploads/")) return;
  try {
    const uploadsDir = getUploadsDir();
    const candidatePath = resolveUploadUrlToPath(url);
    if (!candidatePath.startsWith(uploadsDir + path.sep)) return;
    if (fs.existsSync(candidatePath)) fs.unlinkSync(candidatePath);
  } catch (err) {
    console.warn?.("safeUnlinkUpload failed", { url, err });
  }
};

// -------------------------
// GET ALL BLOG POSTS (public)
// -------------------------
export const getAllBlogPosts = async (_req: Request, res: Response) => {
  try {
    const { userId } = getAuth(_req);
    const isAdmin = userId ? await isAdminUser(userId) : false;

    const page = Number(_req.query.page || 1);
    const limit = Number(_req.query.limit || 9);
    const status =
      _req.query.status === "draft" || _req.query.status === "published"
        ? (_req.query.status as "draft" | "published")
        : undefined;
    const search = asQueryString(_req.query.search);
    const featured =
      _req.query.featured === undefined
        ? undefined
        : _req.query.featured === "true" || _req.query.featured === "1";

    const result = await queries.getBlogPostsPaginated({
      includeDrafts: isAdmin,
      status: !isAdmin && status === "draft" ? undefined : status,
      featured,
      page,
      limit,
      search,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting blog posts:", error);
    res.status(500).json({ error: "Failed to get blog posts" });
  }
};

// -------------------------
// GET SINGLE BLOG POST BY SLUG (public)
// -------------------------
export const getBlogPostBySlug = async (req: Request, res: Response) => {
  try {
    const slug = decodeURIComponent(getId(req.params.slug)).replace(/\/+$/, "");
    const { userId } = getAuth(req);
    const isAdmin = userId ? await isAdminUser(userId) : false;

    const post =
      (await queries.getBlogPostBySlug(slug)) ||
      // Fallback: allow direct UUID access in case links still use id
      (await queries.getBlogPostById(slug));
    if (!post) return res.status(404).json({ error: "Blog post not found" });
    if (!isAdmin && post.status !== "published") {
      return res.status(404).json({ error: "Blog post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error("Error getting blog post:", error);
    res.status(500).json({ error: "Failed to get blog post" });
  }
};

// -------------------------
// CREATE BLOG POST (admin only)
// -------------------------
export const createBlogPost = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const isAdmin = await isAdminUser(userId);
    if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

    const {
      title,
      excerpt,
      content,
      imageUrl,
      slug,
      authorName,
      status,
      featured,
    } = req.body;

    const uploadedImageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : undefined;

    if (!title || !excerpt || !content || (!imageUrl && !uploadedImageUrl)) {
      return res.status(400).json({
        error: "Title, excerpt, content, and image are required",
      });
    }

    if (!isValidStatus(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    const hasLocaleValue = (value?: Record<string, string>) =>
      !!value && Object.values(value).some(v => v?.trim());
    const parsedTitle = parseJSON<Record<string, string>>(title, {
      en: "",
      fa: "",
      ps: "",
    });
    const parsedExcerpt = parseJSON<Record<string, string>>(excerpt, {
      en: "",
      fa: "",
      ps: "",
    });
    const parsedContent = parseJSON<Record<string, string>>(content, {
      en: "",
      fa: "",
      ps: "",
    });
    if (
      !hasLocaleValue(parsedTitle) ||
      !hasLocaleValue(parsedExcerpt) ||
      !hasLocaleValue(parsedContent)
    ) {
      return res.status(400).json({ error: "Invalid localized content" });
    }
    const baseSlug = slugify(
      typeof slug === "string" && slug.trim()
        ? slug
        : parsedTitle.en || Object.values(parsedTitle)[0] || ""
    );

    if (!baseSlug) {
      return res.status(400).json({ error: "Slug is required" });
    }

    const existing = await queries.getBlogPostBySlug(baseSlug);
    if (existing) {
      return res.status(409).json({ error: "Slug already exists" });
    }

    const post = await queries.createBlogPost({
      slug: baseSlug,
      title: parsedTitle,
      excerpt: parsedExcerpt,
      content: parsedContent,
      imageUrl: uploadedImageUrl ?? imageUrl,
      authorName,
      featured: featured === true || featured === "true" || featured === "1",
      status: status ?? "published",
      userId,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ error: "Failed to create blog post" });
  }
};

// -------------------------
// UPDATE BLOG POST (admin only)
// -------------------------
export const updateBlogPost = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const isAdmin = await isAdminUser(userId);
    if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

    const id = getId(req.params.id);
    const {
      title,
      excerpt,
      content,
      imageUrl,
      slug,
      authorName,
      status,
      featured,
    } = req.body;

    if (!isValidStatus(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const uploadedImageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : undefined;

    const existingPost = await queries.getBlogPostById(id);
    if (!existingPost)
      return res.status(404).json({ error: "Blog post not found" });

    const isExternalImageUrl =
      typeof imageUrl === "string" &&
      imageUrl.trim() !== "" &&
      !imageUrl.startsWith("/uploads/");

    if (
      (uploadedImageUrl || isExternalImageUrl) &&
      existingPost.imageUrl?.startsWith("/uploads/")
    ) {
      safeUnlinkUpload(existingPost.imageUrl);
    }

    let nextSlug: string | undefined;
    if (slug !== undefined) {
      const parsedTitle = title
        ? parseJSON<Record<string, string>>(title, {
            en: "",
            fa: "",
            ps: "",
          })
        : undefined;

      nextSlug = slugify(
        typeof slug === "string" && slug.trim()
          ? slug
          : parsedTitle?.en || Object.values(parsedTitle ?? {})[0] || ""
      );

      if (!nextSlug) {
        return res.status(400).json({ error: "Slug is required" });
      }

      const existingSlug = await queries.getBlogPostBySlug(nextSlug);
      if (existingSlug && existingSlug.id !== id) {
        return res.status(409).json({ error: "Slug already exists" });
      }
    }

    const post = await queries.updateBlogPost(id, {
      slug: nextSlug,
      title: title
        ? parseJSON<Record<string, string>>(title, { en: "", fa: "", ps: "" })
        : undefined,
      excerpt: excerpt
        ? parseJSON<Record<string, string>>(excerpt, { en: "", fa: "", ps: "" })
        : undefined,
      content: content
        ? parseJSON<Record<string, string>>(content, { en: "", fa: "", ps: "" })
        : undefined,
      imageUrl: uploadedImageUrl ?? imageUrl,
      authorName,
      featured:
        featured === undefined
          ? undefined
          : featured === true || featured === "true" || featured === "1",
      status,
      publishedAt:
        status === "published" && existingPost.status !== "published"
          ? new Date()
          : undefined,
    });

    res.status(200).json(post);
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({ error: "Failed to update blog post" });
  }
};

// -------------------------
// DELETE BLOG POST (admin only)
// -------------------------
export const deleteBlogPost = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const isAdmin = await isAdminUser(userId);
    if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

    const id = getId(req.params.id);
    const existingPost = await queries.getBlogPostById(id);
    if (!existingPost)
      return res.status(404).json({ error: "Blog post not found" });

    const deleted = await queries.deleteBlogPost(id);
    if (!deleted) return res.status(404).json({ error: "Not found" });

    if (deleted.imageUrl?.startsWith("/uploads/")) {
      safeUnlinkUpload(deleted.imageUrl);
    }

    res.status(200).json({ message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({ error: "Failed to delete blog post" });
  }
};

// -------------------------
// UPLOAD BLOG CONTENT IMAGE (admin only)
// -------------------------
export const uploadBlogImage = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const isAdmin = await isAdminUser(userId);
    if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({ url: imageUrl });
  } catch (error) {
    console.error("Error uploading blog image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
};
