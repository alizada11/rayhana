import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { requireAdmin } from "../middleware/requireAdmin";
import * as contactController from "../controllers/contactController";

const router = Router();

// Public submit
router.post("/", contactController.createMessage);

// Admin manage
router.get("/messages", requireAuth(), requireAdmin, contactController.listMessages);
router.patch("/messages/:id", requireAuth(), requireAdmin, contactController.updateStatus);
router.delete("/messages/:id", requireAuth(), requireAdmin, contactController.deleteMessage);

export default router;
