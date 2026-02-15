import type { Request, Response } from "express";
import crypto from "crypto";
import { ENV } from "../config/env";
import * as queries from "../db/queries";
import { users } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import {
  createSession,
  clearSessionCookie,
  getAuth,
  hashPassword,
  verifyPassword,
  issuePasswordResetToken,
  verifyPasswordResetToken,
  issueEmailVerificationToken,
  verifyEmailVerificationToken,
} from "../lib/auth";
import { sendContactEmail } from "../utils/mailer";
const fetch = globalThis.fetch as typeof globalThis.fetch;

export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });
  if (existing) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const passwordHash = await hashPassword(password);
  const id = crypto.randomUUID();
  let user;
  try {
    [user] = await db
      .insert(users)
      .values({
        id,
        email: normalizedEmail,
        name,
        passwordHash,
      })
      .returning();
  } catch (err: any) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "Email already in use" });
    }
    console.error("Error creating user:", err);
    return res.status(500).json({ error: "Failed to create user" });
  }

  // send verification email, but do not log user in
  sendVerificationEmail(user).catch(err =>
    console.error("verification email failed", err)
  );

  return res.status(201).json({
    verificationRequired: true,
    email: user.email,
    message: "Check your email to verify your account.",
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase().trim()),
  });
  if (!user || !user.passwordHash) {
    return res
      .status(401)
      .json({
        error: "Invalid credentials",
        errorKey: "login_page.invalid_credentials",
      });
  }

  const ok = await verifyPassword(user.passwordHash, password);
  if (!ok) {
    return res
      .status(401)
      .json({
        error: "Invalid credentials",
        errorKey: "login_page.invalid_credentials",
      });
  }

  if (!user.emailVerifiedAt) {
    // Send (or re-send) verification email
    sendVerificationEmail(user).catch(err =>
      console.error("verification email failed", err)
    );
    return res.status(403).json({
      error: "Email not verified",
      verificationRequired: true,
      email: user.email,
    });
  }

  await createSession({
    userId: user.id,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
    res,
  });

  return res.json({
    user: { id: user.id, email: user.email, role: user.role },
  });
}

export async function logout(req: Request, res: Response) {
  const { sessionId } = getAuth(req) as any;
  if (sessionId) {
    await queries.revokeSessionById(sessionId);
  }
  clearSessionCookie(res);
  return res.json({ success: true });
}

export async function me(req: Request, res: Response) {
  const auth = getAuth(req);
  if (!auth.userId) return res.status(401).json({ error: "Unauthorized" });
  const user = await queries.getUserById(auth.userId);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  // Never expose password hash (defense in depth)
  const { passwordHash: _passwordHash, ...safeUser } = user as any;
  return res.json({ user: safeUser });
}

export async function requestPasswordReset(req: Request, res: Response) {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email required" });
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase().trim()),
  });
  if (!user) {
    // avoid leaking existence
    return res.json({ success: true });
  }

  const { token, expiresAt } = await issuePasswordResetToken(user.id);
  const resetUrl = `${ENV.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;
  try {
    await sendContactEmail({
      to: user.email,
      from: ENV.SMTP_FROM_EMAIL || "no-reply@example.com",
      subject: "Reset your Rayhana password",
      html: `<p>Reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires at ${expiresAt.toISOString()}.</p>`,
    });
  } catch (err) {
    console.error("password reset email failed", err);
    // Intentionally still return success to avoid user enumeration.
  }

  return res.json({ success: true });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body || {};
  if (!token || !password) {
    return res
      .status(400)
      .json({ error: "Token and new password are required" });
  }

  const record = await verifyPasswordResetToken(token);
  if (!record)
    return res.status(400).json({ error: "Invalid or expired token" });

  const passwordHash = await hashPassword(password);
  await queries.updateUser(record.userId, { passwordHash });
  await queries.markPasswordResetTokenUsed(record.id);
  await queries.revokeSessionsByUserId(record.userId);

  return res.json({ success: true });
}

async function sendVerificationEmail(user: any) {
  const { token, expiresAt } = await issueEmailVerificationToken(user.id);
  const verifyUrl = `${ENV.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${token}`;
  await sendContactEmail({
    to: user.email,
    from: ENV.SMTP_FROM_EMAIL || "no-reply@example.com",
    subject: "Verify your Rayhana email",
    html: `<p>Welcome! Please verify your email.</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires at ${expiresAt.toISOString()}.</p>`,
  });
}

export async function requestEmailVerification(req: Request, res: Response) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const user = await queries.getUserById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.emailVerifiedAt) {
    return res.json({ success: true, alreadyVerified: true });
  }
  await sendVerificationEmail(user);
  return res.json({ success: true });
}

export async function resendEmailVerification(req: Request, res: Response) {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email required" });
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase().trim()),
  });
  if (!user) {
    return res.json({ success: true }); // do not leak existence
  }
  if (user.emailVerifiedAt) {
    return res.json({ success: true, alreadyVerified: true });
  }
  try {
    await sendVerificationEmail(user);
  } catch (err) {
    console.error("verification email failed", err);
  }

  return res.json({ success: true });
}

export async function verifyEmail(req: Request, res: Response) {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: "Token required" });
  const record = await verifyEmailVerificationToken(token);
  if (!record)
    return res.status(400).json({ error: "Invalid or expired token" });
  await queries.updateUser(record.userId, { emailVerifiedAt: new Date() });
  await queries.markEmailVerificationTokenUsed(record.id);
  return res.json({ success: true, redirect: "/login" });
}

// --- OAuth (Google) ---
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

const googleRedirectUri =
  ENV.GOOGLE_REDIRECT_URI ||
  "http://localhost:3001/api/auth/oauth/google/callback";

export async function startGoogleOAuth(req: Request, res: Response) {
  if (!ENV.GOOGLE_CLIENT_ID || !ENV.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: "Google OAuth not configured" });
  }
  const state = crypto.randomBytes(16).toString("hex");
  const nonce = crypto.randomBytes(16).toString("hex");
  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: ENV.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000,
  };
  res.cookie("oauth_state", state, cookieOpts);
  res.cookie("oauth_nonce", nonce, cookieOpts);

  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", ENV.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", googleRedirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);

  return res.redirect(url.toString());
}

export async function googleOAuthCallback(req: Request, res: Response) {
  if (!ENV.GOOGLE_CLIENT_ID || !ENV.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: "Google OAuth not configured" });
  }

  const stateCookie = req.cookies?.oauth_state;
  if (!stateCookie || stateCookie !== req.query.state) {
    return res.status(400).send("Invalid state");
  }

  const code = req.query.code as string | undefined;
  if (!code) return res.status(400).send("Missing code");

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: ENV.GOOGLE_CLIENT_ID,
      client_secret: ENV.GOOGLE_CLIENT_SECRET,
      redirect_uri: googleRedirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });
  if (!tokenRes.ok) {
    return res.status(400).send("Failed to exchange code");
  }
  const tokenData = (await tokenRes.json()) as any;
  const accessToken = tokenData.access_token as string | undefined;
  if (!accessToken) {
    return res.status(400).send("Invalid token response: missing access token");
  }

  const uiRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!uiRes.ok) {
    return res.status(400).send("Failed to fetch user info");
  }
  const ui = (await uiRes.json()) as any;

  const email = (ui.email as string | undefined)?.toLowerCase();
  const name = (ui.name as string | undefined) || ui.given_name;
  const providerUserId = ui.sub as string | undefined;

  if (!email || !providerUserId) {
    return res.status(400).send("Email is required from provider");
  }

  let user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) {
    const id = crypto.randomUUID();
    const [created] = await db
      .insert(users)
      .values({
        id,
        email,
        name,
        emailVerifiedAt: new Date(),
      })
      .returning();
    user = created;
  }

  await queries.upsertOauthAccount({
    provider: "google",
    providerUserId: providerUserId || email,
    userId: user.id,
    accessToken,
    refreshToken: tokenData.refresh_token,
    expiresAt: tokenData.expires_in
      ? new Date(Date.now() + Number(tokenData.expires_in) * 1000)
      : null,
  } as any);

  // Ensure OAuth users are marked verified
  if (!user.emailVerifiedAt) {
    await queries.updateUser(user.id, { emailVerifiedAt: new Date() });
  }

  await createSession({
    userId: user.id,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
    res,
  });

  const frontendBase = (ENV.FRONTEND_URL || "http://localhost:3000").replace(
    /\/+$/,
    ""
  );
  const redirectTo = `${frontendBase}/login`;
  return res.redirect(redirectTo);
}

function decodeJwt(token: string): any {
  const [, payload] = token.split(".");
  const pad = payload.padEnd(
    payload.length + ((4 - (payload.length % 4)) % 4),
    "="
  );
  const json = Buffer.from(
    pad.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  ).toString("utf8");
  return JSON.parse(json);
}
