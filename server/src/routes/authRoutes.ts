import { Router } from "express";
import {
  register,
  login,
  logout,
  me,
  requestPasswordReset,
  resetPassword,
  startGoogleOAuth,
  googleOAuthCallback,
  requestEmailVerification,
  verifyEmail,
  resendEmailVerification,
} from "../controllers/authController";
import { requireAuth } from "../lib/auth";
import rateLimit from "express-rate-limit";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  keyGenerator: req => (typeof req.body?.email === "string" ? req.body.email.toLowerCase() : req.ip),
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: req => (typeof req.body?.email === "string" ? req.body.email.toLowerCase() : req.ip),
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/logout", requireAuth(), logout);
router.get("/me", requireAuth(), me);

router.post("/password/forgot", forgotLimiter, requestPasswordReset);
router.post("/password/reset", resetPassword);
router.post("/email/verify/request", requireAuth(), requestEmailVerification);
const resendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});
router.post("/email/verify/resend", resendLimiter, resendEmailVerification);
router.post("/email/verify", verifyEmail);

router.get("/oauth/google", startGoogleOAuth);
router.get("/oauth/google/callback", googleOAuthCallback);

export default router;
