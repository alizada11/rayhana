import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { requireAdmin } from "../middleware/requireAdmin";
import * as controller from "../controllers/worldCupCampaignController";

const router = Router();

router.get("/status", controller.status);
router.get("/live-stats", controller.liveStats);
router.post("/predictions", controller.submit);
router.get("/final-stage", controller.finalStage);
router.post("/final-predictions", controller.submitFinal);
router.get("/public-winners", controller.publicLotteryWinners);

router.get("/admin/predictions", requireAuth(), requireAdmin, controller.adminList);
router.patch(
  "/admin/predictions/:id/winner-status",
  requireAuth(),
  requireAdmin,
  controller.updateWinnerStatus
);
router.delete(
  "/admin/predictions",
  requireAuth(),
  requireAdmin,
  controller.deleteAllPredictions
);
router.get(
  "/admin/final-settings",
  requireAuth(),
  requireAdmin,
  controller.adminFinalSettings
);
router.put(
  "/admin/final-settings",
  requireAuth(),
  requireAdmin,
  controller.updateFinalSettings
);
router.get(
  "/admin/final-predictions",
  requireAuth(),
  requireAdmin,
  controller.adminFinalPredictions
);
router.get(
  "/admin/lottery-eligibility",
  requireAuth(),
  requireAdmin,
  controller.lotteryEligibility
);
router.post(
  "/admin/lottery-draws",
  requireAuth(),
  requireAdmin,
  controller.executeLottery
);
router.get(
  "/admin/lottery-draws",
  requireAuth(),
  requireAdmin,
  controller.adminLotteryDraws
);
router.patch(
  "/admin/lottery-draws/:id/publish",
  requireAuth(),
  requireAdmin,
  controller.publishLottery
);

export default router;
