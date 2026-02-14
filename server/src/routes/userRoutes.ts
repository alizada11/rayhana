import { Router } from "express";
import {
  deleteUserAdmin,
  getMe,
  getUser,
  listUsers,
  syncUser,
  updateUserAdmin,
} from "../controllers/userController";
import { requireAuth } from "../lib/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

// /api/users/sync - POST => sync the clerk user to DB (PROTECTED)
router.post("/sync", requireAuth(), syncUser);
router.get("/me", requireAuth(), getMe);
router.get("/admin", requireAdmin, listUsers);
router.get("/admin/:id", requireAdmin, getUser);
router.patch("/admin/:id", requireAdmin, updateUserAdmin);
router.delete("/admin/:id", requireAdmin, deleteUserAdmin);

export default router;
