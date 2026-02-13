import type { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import argon2 from "argon2";
import { ENV } from "../config/env";
import * as queries from "../db/queries";
import { db } from "../db";
import { authSessions, users } from "../db/schema";
import { eq } from "drizzle-orm";

// Constants
const SESSION_COOKIE = "session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const RESET_TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour
const VERIFY_TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export type AuthContext = {
  userId: string;
  sessionId: string;
};

// Cookie parser middleware to be used before auth middleware
export const cookies = cookieParser();

export async function hashPassword(plain: string) {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, plain: string) {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(opts: {
  userId: string;
  userAgent?: string;
  ip?: string;
  res: Response;
}) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await queries.createSession({
    userId: opts.userId,
    tokenHash,
    userAgent: opts.userAgent,
    ip: opts.ip,
    expiresAt,
  });

  opts.res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: ENV.NODE_ENV === "production",
    expires: expiresAt,
  });

  return { token, expiresAt };
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE);
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;
    const bearer = header?.startsWith("Bearer ")
      ? header.slice("Bearer ".length)
      : undefined;
    const raw = (req.cookies?.[SESSION_COOKIE] as string | undefined) || bearer;
    if (!raw) return next();
    const tokenHash = hashToken(raw);

    const session = await queries.findSessionByTokenHash(tokenHash);
    if (!session || session.revoked || session.expiresAt < new Date()) {
      return next();
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) return next();

    // attach auth context
    (req as any).auth = { userId: user.id, sessionId: session.id };
    (req as any).user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

export function getAuth(req: Request): AuthContext | { userId: null } {
  const auth = (req as any).auth as AuthContext | undefined;
  return auth ? auth : { userId: null };
}

export function requireAuth() {
  return (req: Request, res: Response, next: NextFunction) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    return next();
  };
}

export function optionalAuth() {
  return (_req: Request, _res: Response, next: NextFunction) => next();
}

export function requireRole(role: "admin" | "guest") {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (user.role !== role)
      return res.status(403).json({ error: `${role} role required` });
    return next();
  };
}

export async function issuePasswordResetToken(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await queries.createPasswordResetToken({
    userId,
    tokenHash,
    expiresAt,
  });

  return { token, expiresAt };
}

export async function verifyPasswordResetToken(token: string) {
  const tokenHash = hashToken(token);
  const record = await queries.findValidPasswordResetToken(tokenHash);
  if (!record) return null;
  if (record.expiresAt < new Date()) return null;
  return record;
}

export async function issueEmailVerificationToken(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);

  await queries.createEmailVerificationToken({
    userId,
    tokenHash,
    expiresAt,
  });

  return { token, expiresAt };
}

export async function verifyEmailVerificationToken(token: string) {
  const tokenHash = hashToken(token);
  const record = await queries.findValidEmailVerificationToken(tokenHash);
  if (!record) return null;
  if (record.expiresAt < new Date()) return null;
  return record;
}
