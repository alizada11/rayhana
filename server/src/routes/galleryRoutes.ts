import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { upload } from "../middleware/upload";
import { requireAdmin } from "../middleware/requireAdmin";
import { requireGuest } from "../middleware/requireGuest";
import * as galleryController from "../controllers/galleryController";

const router = Router();

// Public: approved gallery
router.get("/", galleryController.getApprovedGallery);

// Guest-only: submit a photo
router.post(
  "/",
  requireAuth(),
  requireGuest,
  upload.single("image"),
  galleryController.createGallerySubmission
);

// Guest-only: my submissions
router.get("/my", requireAuth(), requireGuest, galleryController.getMyGallery);
router.delete(
  "/my/:id",
  requireAuth(),
  requireGuest,
  galleryController.deleteMyGallerySubmission
);

// Admin: list all submissions
router.get("/admin", requireAuth(), requireAdmin, galleryController.getAllGallery);

// Admin: approve/reject/delete
router.patch(
  "/:id/approve",
  requireAuth(),
  requireAdmin,
  galleryController.approveGallerySubmission
);
router.patch(
  "/:id/reject",
  requireAuth(),
  requireAdmin,
  galleryController.rejectGallerySubmission
);
router.delete(
  "/:id",
  requireAuth(),
  requireAdmin,
  galleryController.deleteGallerySubmission
);

// Any signed-in user: like/unlike
router.post("/:id/like", requireAuth(), galleryController.toggleLike);

export default router;
