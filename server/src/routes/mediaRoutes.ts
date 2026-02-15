import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { requireAdmin } from "../middleware/requireAdmin";
import { uploadMedia } from "../middleware/uploadMedia";
import * as mediaController from "../controllers/mediaController";

const router = Router();

// Admin: upload media
router.post(
  "/",
  requireAuth(),
  requireAdmin,
  uploadMedia.single("file"),
  mediaController.uploadMedia
);

// Authenticated (guest/admin): upload avatar/media for own profile
router.post(
  "/avatar",
  requireAuth(),
  uploadMedia.single("file"),
  mediaController.uploadMedia
);

// Authenticated delete own avatar upload
router.delete(
  "/avatar/:id",
  requireAuth(),
  mediaController.deleteOwnMedia
);

// Admin: list media
router.get("/", requireAuth(), requireAdmin, mediaController.listMedia);

// Admin: delete media
router.delete("/:id", requireAuth(), requireAdmin, mediaController.deleteMedia);

export default router;
