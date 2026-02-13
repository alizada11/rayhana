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

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", requireAuth(), logout);
router.get("/me", requireAuth(), me);

router.post("/password/forgot", requestPasswordReset);
router.post("/password/reset", resetPassword);
router.post("/email/verify/request", requireAuth(), requestEmailVerification);
router.post("/email/verify/resend", resendEmailVerification);
router.post("/email/verify", verifyEmail);

router.get("/oauth/google", startGoogleOAuth);
router.get("/oauth/google/callback", googleOAuthCallback);

export default router;
