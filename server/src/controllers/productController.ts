import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

// Utility to normalize ID from params
const getId = (rawId: string | string[]) =>
  Array.isArray(rawId) ? rawId[0] : rawId;

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
    } = req.body;

    // Validate required fields
    if (!title || !description || !imageUrl || !category) {
      return res.status(400).json({
        error: "Title, description, imageUrl, and category are required",
      });
    }

    const product = await queries.createProduct({
      title,
      description,
      imageUrl,
      category,
      rating: rating ?? 5,
      sizes: sizes ?? [],
      colors: colors ?? [],
      prices: prices ?? {},
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
    } = req.body;

    const existingProduct = await queries.getProductById(id);
    if (!existingProduct)
      return res.status(404).json({ error: "Product not found" });
    if (existingProduct.userId !== userId)
      return res
        .status(403)
        .json({ error: "You can only update your own products" });

    const product = await queries.updateProduct(id, {
      title,
      description,
      imageUrl,
      category,
      rating,
      sizes,
      colors,
      prices,
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
