import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { requireAdmin } from "../middleware/requireAdmin";
import * as dashboardController from "../controllers/dashboardController";

const router = Router();

router.get("/stats", requireAuth(), requireAdmin, dashboardController.getStats);
router.post(
  "/cache/clear",
  requireAuth(),
  requireAdmin,
  dashboardController.clearCache
);

export default router;
