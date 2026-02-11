import { Router, type RequestHandler } from "express";
import { requireAuth } from "@clerk/express";
import rateLimit from "express-rate-limit";
import { requireAdmin } from "../middleware/requireAdmin";
import * as contactController from "../controllers/contactController";

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
}) as unknown as RequestHandler;

// Public submit
router.post("/", contactLimiter, contactController.createMessage);

// Admin manage
router.get(
  "/messages",
  requireAuth(),
  requireAdmin,
  contactController.listMessages
);
router.patch(
  "/messages/:id",
  requireAuth(),
  requireAdmin,
  contactController.updateStatus
);
router.delete(
  "/messages/:id",
  requireAuth(),
  requireAdmin,
  contactController.deleteMessage
);

export default router;
