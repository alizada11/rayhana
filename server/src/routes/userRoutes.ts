import { Router } from "express";
import {
  deleteUserAdmin,
  getMyProfile,
  getMe,
  getUser,
  listUsers,
  syncUser,
  updateUserAdmin,
  updateMyProfile,
  changeMyPassword,
} from "../controllers/userController";
import { requireAuth, requireRole } from "../lib/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

// /api/users/sync - POST => sync the clerk user to DB (PROTECTED)
router.post("/sync", requireAuth(), syncUser);
router.get("/me", requireAuth(), getMe);
router.get("/profile", requireAuth(), requireRole("guest"), getMyProfile);
router.patch("/profile", requireAuth(), requireRole("guest"), updateMyProfile);
router.post("/profile/password", requireAuth(), requireRole("guest"), changeMyPassword);
router.get("/admin", requireAdmin, listUsers);
router.get("/admin/:id", requireAdmin, getUser);
router.patch("/admin/:id", requireAdmin, updateUserAdmin);
router.delete("/admin/:id", requireAdmin, deleteUserAdmin);

export default router;
