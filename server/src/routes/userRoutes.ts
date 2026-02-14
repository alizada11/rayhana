import { Router } from "express";
import { getMe, syncUser } from "../controllers/userController";
import { requireAuth } from "../lib/auth";

const router = Router();

// /api/users/sync - POST => sync the clerk user to DB (PROTECTED)
router.post("/sync", requireAuth(), syncUser);
router.get("/me", requireAuth(), getMe);

export default router;
