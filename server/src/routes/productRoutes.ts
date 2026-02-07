import { Router } from "express";
import * as productController from "../controllers/productController";
import { requireAuth } from "@clerk/express";
import { upload } from "../middleware/upload";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

// GET /api/products => Get all products (public)
router.get("/", productController.getAllProducts);

// GET /api/products/my - Get current user's products (protected)
router.get("/my", requireAuth(), requireAdmin, productController.getMyProducts);

// GET /api/products/:id - Get single product by ID (public)
router.get("/:id", productController.getProductById);

// POST /api/products - Create new product (protected)
router.post(
  "/",
  requireAuth(),
  requireAdmin,
  upload.single("image"),
  productController.createProduct
);

// PUT /api/products/:id - Update product (protected - owner only)
router.put(
  "/:id",
  requireAuth(),
  requireAdmin,
  upload.single("image"),
  productController.updateProduct
);

// DELETE /api/products/:id - Delete product (protected - owner only)
router.delete("/:id", requireAuth(), requireAdmin, productController.deleteProduct);

export default router;
