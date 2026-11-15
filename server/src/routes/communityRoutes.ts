import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { requireAdmin } from "../middleware/requireAdmin";
import { adminSummary, submitAnonymousResponse } from "../controllers/communityController";

const router = Router();

router.post("/responses", submitAnonymousResponse);
router.get("/admin/responses", requireAuth(), requireAdmin, adminSummary);

export default router;
