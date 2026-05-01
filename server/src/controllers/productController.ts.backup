import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "../lib/auth";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { requireAdmin } from "../middleware/requireAdmin";

// Utility to normalize ID from params
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

const normalizeProductUrl = (raw?: unknown) => {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
};

const localizedString = z.record(z.string(), z.string());

const productSchema = z.object({
  title: localizedString.refine(
    v => Object.values(v).some(s => s?.trim().length > 0),
    { message: "Title is required in at least one language" }
  ),
  description: localizedString.refine(
    v => Object.values(v).some(s => s?.trim().length > 0),
    { message: "Description is required in at least one language" }
  ),
  category: z.string().min(1),
  rating: z.number().min(1).max(5).optional(),
  sizes: z.array(z.number()).max(50).optional(),
  colors: z.array(z.string()).max(50).optional(),
  prices: z.record(z.string(), z.number()).optional(),
  productUrl: z.string().url().optional(),
  // allow relative /uploads/... or absolute URL
  imageUrl: z
    .string()
    .min(1)
    .refine(
      v => v.startsWith("/uploads/") || /^https?:\/\//i.test(v),
      "imageUrl must be /uploads/... or an http(s) URL"
    ),
});

const reviewSchema = z.object({
  author: z.string().min(1),
  text: localizedString.refine(
    v => Object.values(v).some(s => s?.trim().length > 0),
    { message: "Review text is required" }
  ),
  rating: z.number().min(1).max(5),
  verified: z.boolean().optional(),
});

// -------------------------
// GET ALL PRODUCTS (public)
// -------------------------
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await queries.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({ error: "Failed to get products" });
  }
};

// -------------------------
// GET CURRENT USER PRODUCTS (protected)
// -------------------------
export const getMyProducts = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const products = await queries.getProductsByUserId(userId);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error getting user products:", error);
    res.status(500).json({ error: "Failed to get user products" });
  }
};

// -------------------------
// GET SINGLE PRODUCT BY ID (public)
// -------------------------
export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const product = await queries.getProductById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    console.error("Error getting product:", error);
    res.status(500).json({ error: "Failed to get product" });
  }
};

// -------------------------
// CREATE PRODUCT (protected)
// -------------------------
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const {
      title,
      description,
      imageUrl,
      category,
      rating,
      sizes,
      colors,
      prices,
      productUrl,
    } = req.body;

    const uploadedImageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : undefined;

    // Validate required fields
    if (!title || !description || !category || (!imageUrl && !uploadedImageUrl)) {
      return res.status(400).json({
        error: "Title, description, category, and image are required",
      });
    }

    const normalizedProductUrl = normalizeProductUrl(productUrl);
    if (normalizedProductUrl === null) {
      return res.status(400).json({ error: "Invalid productUrl protocol" });
    }

    const payload = {
      title: parseJSON<Record<string, string>>(title, { en: "", fa: "", ps: "" }),
      description: parseJSON<Record<string, string>>(description, {
        en: "",
        fa: "",
        ps: "",
      }),
      imageUrl: (uploadedImageUrl ?? imageUrl) as string,
      productUrl: normalizedProductUrl,
      category,
      rating: Number(rating ?? 5),
      sizes: parseJSON<number[]>(sizes, []),
      colors: parseJSON<string[]>(colors, []),
      prices: parseJSON<Record<string, number>>(prices, {}),
      userId,
    };

    const parsed = productSchema.safeParse(payload);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message });
    }

    const product = await queries.createProduct({ ...parsed.data, userId });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

// -------------------------
// UPDATE PRODUCT (protected - owner only)
// -------------------------
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const id = getId(req.params.id);
    const {
      title,
      description,
      imageUrl,
      category,
      rating,
      sizes,
      colors,
      prices,
      productUrl,
    } = req.body;

    const uploadedImageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : undefined;

    const existingProduct = await queries.getProductById(id);
    if (!existingProduct)
      return res.status(404).json({ error: "Product not found" });
    if (existingProduct.userId !== userId)
      return res
        .status(403)
        .json({ error: "You can only update your own products" });

    // If a new image was uploaded, delete the old local file (if any).
    if (uploadedImageUrl && existingProduct.imageUrl?.startsWith("/uploads/")) {
      const oldPath = path.join(process.cwd(), existingProduct.imageUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const normalizedProductUrl =
      productUrl !== undefined ? normalizeProductUrl(productUrl) : undefined;
    if (normalizedProductUrl === null) {
      return res.status(400).json({ error: "Invalid productUrl protocol" });
    }

    const payload = {
      title: title
        ? parseJSON<Record<string, string>>(title, { en: "", fa: "", ps: "" })
        : existingProduct.title,
      description: description
        ? parseJSON<Record<string, string>>(description, {
            en: "",
            fa: "",
            ps: "",
          })
        : existingProduct.description,
      imageUrl: uploadedImageUrl ?? imageUrl ?? existingProduct.imageUrl,
      productUrl:
        normalizedProductUrl === undefined
          ? existingProduct.productUrl
          : normalizedProductUrl,
      category: category ?? existingProduct.category,
      rating:
        rating !== undefined ? Number(rating) : Number(existingProduct.rating),
      sizes: sizes ? parseJSON<number[]>(sizes, []) : existingProduct.sizes,
      colors: colors ? parseJSON<string[]>(colors, []) : existingProduct.colors,
      prices: prices
        ? parseJSON<Record<string, number>>(prices, {})
        : existingProduct.prices,
    };

    const parsed = productSchema.safeParse(payload);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message });
    }

    const product = await queries.updateProduct(id, parsed.data);

    res.status(200).json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

// -------------------------
// DELETE PRODUCT (protected - owner only)
// -------------------------
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const id = getId(req.params.id);
    const existingProduct = await queries.getProductById(id);
    if (!existingProduct)
      return res.status(404).json({ error: "Product not found" });
    if (existingProduct.userId !== userId)
      return res
        .status(403)
        .json({ error: "You can only delete your own products" });

    await queries.deleteProduct(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

// -------------------------
// PRODUCT REVIEWS (admin)
// -------------------------

export const createProductReview = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const productId = getId(req.params.id);
    const product = await queries.getProductById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message });
    }

    const review = await queries.createProductReview({
      ...parsed.data,
      verified: parsed.data.verified ?? true,
      productId,
    });
    res.status(201).json(review);
  } catch (error) {
    console.error("Error creating product review:", error);
    res.status(500).json({ error: "Failed to create product review" });
  }
};

export const updateProductReview = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const productId = getId(req.params.id);
    const reviewId = getId(req.params.reviewId);

    const existing = await queries.getProductById(productId);
    if (!existing) return res.status(404).json({ error: "Product not found" });

    const parsed = reviewSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message });
    }

    const updated = await queries.updateProductReview(
      reviewId,
      productId,
      parsed.data
    );
    if (!updated) return res.status(404).json({ error: "Review not found" });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating product review:", error);
    res.status(500).json({ error: "Failed to update product review" });
  }
};

export const deleteProductReview = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const productId = getId(req.params.id);
    const reviewId = getId(req.params.reviewId);

    const product = await queries.getProductById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const deleted = await queries.deleteProductReview(reviewId, productId);
    if (!deleted) return res.status(404).json({ error: "Review not found" });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting product review:", error);
    res.status(500).json({ error: "Failed to delete product review" });
  }
};
