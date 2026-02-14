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

// Admin: list media
router.get("/", requireAuth(), requireAdmin, mediaController.listMedia);

// Admin: delete media
router.delete("/:id", requireAuth(), requireAdmin, mediaController.deleteMedia);

export default router;
