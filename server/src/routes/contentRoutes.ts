import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { requireAdmin } from "../middleware/requireAdmin";
import * as contentController from "../controllers/contentController";

const router = Router();

// Public: fetch content by key
router.get("/:key", contentController.getContentByKey);

// Admin: list all content
router.get("/", requireAuth(), requireAdmin, contentController.getAllContent);

// Admin: upsert content by key
router.put("/:key", requireAuth(), requireAdmin, contentController.upsertContent);

export default router;
