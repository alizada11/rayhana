import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { requireAdmin } from "../middleware/requireAdmin";
import * as newsletterController from "../controllers/newsletterController";

const router = Router();

router.post("/", newsletterController.subscribe);
router.get("/admin", requireAuth(), requireAdmin, newsletterController.list);
router.get("/admin/export", requireAuth(), requireAdmin, newsletterController.exportCsv);

export default router;
