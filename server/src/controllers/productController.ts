import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";
import fs from "fs";
import path from "path";

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

    const product = await queries.createProduct({
      title: parseJSON<Record<string, string>>(title, { en: "", fa: "", ps: "" }),
      description: parseJSON<Record<string, string>>(description, {
        en: "",
        fa: "",
        ps: "",
      }),
      imageUrl: uploadedImageUrl ?? imageUrl,
      productUrl: normalizedProductUrl,
      category,
      rating: Number(rating ?? 5),
      sizes: parseJSON<number[]>(sizes, []),
      colors: parseJSON<string[]>(colors, []),
      prices: parseJSON<Record<string, number>>(prices, {}),
      userId,
    });

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

    const product = await queries.updateProduct(id, {
      title: title
        ? parseJSON<Record<string, string>>(title, { en: "", fa: "", ps: "" })
        : undefined,
      description: description
        ? parseJSON<Record<string, string>>(description, {
            en: "",
            fa: "",
            ps: "",
          })
        : undefined,
      imageUrl: uploadedImageUrl ?? imageUrl,
      productUrl: normalizedProductUrl,
      category,
      rating: rating !== undefined ? Number(rating) : undefined,
      sizes: sizes ? parseJSON<number[]>(sizes, []) : undefined,
      colors: colors ? parseJSON<string[]>(colors, []) : undefined,
      prices: prices ? parseJSON<Record<string, number>>(prices, {}) : undefined,
    });

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
