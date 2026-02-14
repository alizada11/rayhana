import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { requireAdmin } from "../middleware/requireAdmin";
import * as dashboardController from "../controllers/dashboardController";

const router = Router();

router.get("/stats", requireAuth(), requireAdmin, dashboardController.getStats);

export default router;
