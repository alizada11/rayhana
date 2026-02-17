import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const CSRF_COOKIE = "csrfToken";
const CSRF_HEADER = "x-csrf-token";
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Double-submit cookie approach: issue a non-httpOnly cookie and require the matching header.
export function csrfMiddleware(req: Request, res: Response, next: NextFunction) {
  const existing = req.cookies?.[CSRF_COOKIE] as string | undefined;
  const token = existing || crypto.randomBytes(24).toString("hex");

  // Always refresh cookie to extend lifetime (session cookie).
  res.cookie(CSRF_COOKIE, token, {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  });

  if (!unsafeMethods.has(req.method.toUpperCase())) {
    return next();
  }

  const header = req.headers[CSRF_HEADER] as string | undefined;
  // Enforce match only when a token existed and a header is present.
  if (existing && header && header !== existing) {
    return res.status(403).json({ error: "CSRF token mismatch" });
  }

  return next();
}
