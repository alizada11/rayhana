import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { requireAdmin } from "../middleware/requireAdmin";
import * as preLaunchReservationController from "../controllers/preLaunchReservationController";

const router = Router();

router.post("/", preLaunchReservationController.create);
router.get("/my", requireAuth(), preLaunchReservationController.my);

router.post(
  "/admin",
  requireAuth(),
  requireAdmin,
  preLaunchReservationController.adminCreate
);
router.get(
  "/admin",
  requireAuth(),
  requireAdmin,
  preLaunchReservationController.list
);
router.get(
  "/admin/:id",
  requireAuth(),
  requireAdmin,
  preLaunchReservationController.getOne
);
router.patch(
  "/admin/:id",
  requireAuth(),
  requireAdmin,
  preLaunchReservationController.update
);
router.delete(
  "/admin/:id",
  requireAuth(),
  requireAdmin,
  preLaunchReservationController.remove
);

export default router;
