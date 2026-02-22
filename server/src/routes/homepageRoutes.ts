import { Router } from "express";
import { getHomepage } from "../controllers/contentController";

const router = Router();

// Public aggregated homepage payload
router.get("/", getHomepage);

export default router;
