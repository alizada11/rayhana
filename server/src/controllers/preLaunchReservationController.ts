import type { Request, Response } from "express";
import crypto from "crypto";
import { z } from "zod";
import { ENV } from "../config/env";
import * as queries from "../db/queries";
import {
  getAuth,
  hashPassword,
  issueEmailVerificationToken,
  issuePasswordResetToken,
} from "../lib/auth";
import { sendContactEmail } from "../utils/mailer";

const statuses = ["pending", "contacted", "completed"] as const;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const normalizeWhatsapp = (value: string) =>
  value.replace(/[\s().-]/g, "").trim();

const isValidWhatsapp = (value: string) => /^\+[1-9]\d{6,14}$/.test(value);

const reservationSchema = z.object({
  productId: z.string().uuid(),
  productSize: z.string().trim().min(1).max(40),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  whatsapp: z.string().trim().min(1),
  region: z.string().trim().min(2).max(80),
});

const adminUpdateSchema = reservationSchema
  .partial()
  .extend({
    status: z.enum(statuses).optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const getFrontendBase = () =>
  (ENV.FRONTEND_URL || "http://localhost:5173")
    .split(",")[0]
    .replace(/\/+$/, "");

const getAdminReservationUrl = (id: string, action?: "delete") => {
  const url = new URL(`${getFrontendBase()}/dashboard/pre-launch-reservations`);
  url.searchParams.set("reservation", id);
  if (action) url.searchParams.set("action", action);
  return url.toString();
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const localizeProductTitle = (product: any) => {
  const title = product?.title;
  if (!title) return "Unknown product";
  if (typeof title === "string") return title;
  return title.en || Object.values(title)[0] || "Unknown product";
};

async function sendGuestAccountEmail(user: any) {
  const [{ token: verifyToken, expiresAt }, { token: resetToken }] =
    await Promise.all([
      issueEmailVerificationToken(user.id),
      issuePasswordResetToken(user.id),
    ]);

  const verifyUrl = `${getFrontendBase()}/verify-email?token=${verifyToken}`;
  const resetUrl = `${getFrontendBase()}/reset-password?token=${resetToken}`;

  await sendContactEmail({
    to: user.email,
    from: ENV.SMTP_FROM_EMAIL || "no-reply@rayhana.com",
    subject: "Your Rayhana discount reservation",
    html: `<p>Your Rayhana pre-launch discount is reserved.</p>
<p>We created an account for this email so you can manage the reservation later.</p>
<p><a href="${escapeHtml(verifyUrl)}">Verify your email</a></p>
<p><a href="${escapeHtml(resetUrl)}">Set your password</a></p>
<p>The verification link expires at ${escapeHtml(expiresAt.toISOString())}.</p>`,
  });
}

async function sendAdminNotification(reservation: any) {
  const productTitle = localizeProductTitle(reservation.product);
  const editUrl = getAdminReservationUrl(reservation.id);
  const deleteUrl = getAdminReservationUrl(reservation.id, "delete");

  await sendContactEmail({
    to: "info@rayhana.com",
    from: ENV.SMTP_FROM_EMAIL || "no-reply@rayhana.com",
    subject: `New pre-launch reservation: ${productTitle}`,
    html: `<h2>New pre-launch reservation</h2>
<p><strong>Product:</strong> ${escapeHtml(productTitle)}</p>
<p><strong>Size:</strong> ${escapeHtml(reservation.productSize)}</p>
<p><strong>Name:</strong> ${escapeHtml(reservation.fullName)}</p>
<p><strong>Email:</strong> ${escapeHtml(reservation.email)}</p>
<p><strong>WhatsApp:</strong> ${escapeHtml(reservation.whatsapp)}</p>
<p><strong>Region:</strong> ${escapeHtml(reservation.region)}</p>
<p><strong>Status:</strong> ${escapeHtml(reservation.status)}</p>
<p><a href="${escapeHtml(editUrl)}">Edit reservation</a></p>
<p><a href="${escapeHtml(deleteUrl)}">Delete reservation in dashboard</a></p>`,
  });
}

async function resolveReservationUser({
  authUserId,
  email,
  fullName,
}: {
  authUserId?: string | null;
  email: string;
  fullName: string;
}) {
  if (authUserId) return { userId: authUserId, createdGuestUser: null };

  const existing = await queries.getUserByEmail(email);
  if (existing) return { userId: existing.id, createdGuestUser: null };

  const randomPassword = crypto.randomBytes(24).toString("hex");
  const user = await queries.createUser({
    id: crypto.randomUUID(),
    email,
    name: fullName,
    passwordHash: await hashPassword(randomPassword),
  });

  return { userId: user.id, createdGuestUser: user };
}

async function createReservationFromRequest(
  req: Request,
  res: Response,
  authUserId?: string | null
) {
  const parsed = reservationSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message });
  }

  const email = normalizeEmail(parsed.data.email);
  const whatsapp = normalizeWhatsapp(parsed.data.whatsapp);
  if (!isValidWhatsapp(whatsapp)) {
    return res.status(400).json({
      error:
        "WhatsApp must include a valid country code, for example +447700900123",
    });
  }

  const product = await queries.getProductById(parsed.data.productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const duplicate = await queries.getPreLaunchReservationByDuplicateKey({
    email,
    productId: parsed.data.productId,
    productSize: parsed.data.productSize,
  });
  if (duplicate) {
    return res.status(409).json({
      error: "A reservation already exists for this email, product, and size.",
      reservation: duplicate,
    });
  }

  const { userId, createdGuestUser } = await resolveReservationUser({
    authUserId,
    email,
    fullName: parsed.data.fullName,
  });

  const reservation = await queries.createPreLaunchReservation({
    productId: parsed.data.productId,
    productSize: parsed.data.productSize,
    fullName: parsed.data.fullName,
    email,
    whatsapp,
    region: parsed.data.region,
    userId,
    status: "pending",
  });

  const reservationWithProduct =
    (await queries.getPreLaunchReservationById(reservation.id)) ?? reservation;

  await Promise.allSettled([
    sendAdminNotification(reservationWithProduct),
    createdGuestUser
      ? sendGuestAccountEmail(createdGuestUser)
      : Promise.resolve(),
  ]);

  return res.status(201).json(reservationWithProduct);
}

export const create = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  return createReservationFromRequest(req, res, userId);
};

export const adminCreate = async (req: Request, res: Response) => {
  return createReservationFromRequest(req, res, null);
};

export const my = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const user = await queries.getUserById(userId);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const email = normalizeEmail(user.email);
  await queries.claimPreLaunchReservationsForUser({ userId, email });
  const reservations = await queries.getPreLaunchReservationsForUser({
    userId,
    email,
  });

  return res.status(200).json(reservations);
};

export const list = async (req: Request, res: Response) => {
  const { product, region, status, search, cursor, limit = 20 } = req.query;
  const safeStatus = statuses.includes(status as any)
    ? (status as queries.PreLaunchReservationStatus)
    : undefined;

  const result = await queries.listPreLaunchReservations({
    productId: product ? String(product) : undefined,
    region: region ? String(region) : undefined,
    status: safeStatus,
    search: search ? String(search) : undefined,
    cursorId: cursor ? String(cursor) : undefined,
    limit: Math.min(Number(limit) || 20, 200),
  });

  return res.status(200).json(result);
};

export const getOne = async (req: Request, res: Response) => {
  const reservation = await queries.getPreLaunchReservationById(req.params.id);
  if (!reservation)
    return res.status(404).json({ error: "Reservation not found" });
  return res.status(200).json(reservation);
};

export const update = async (req: Request, res: Response) => {
  const parsed = adminUpdateSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message });
  }

  const existing = await queries.getPreLaunchReservationById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Reservation not found" });
  }

  const payload: any = { ...parsed.data };
  if (payload.email) payload.email = normalizeEmail(payload.email);
  if (payload.whatsapp) {
    payload.whatsapp = normalizeWhatsapp(payload.whatsapp);
    if (!isValidWhatsapp(payload.whatsapp)) {
      return res.status(400).json({
        error:
          "WhatsApp must include a valid country code, for example +447700900123",
      });
    }
  }

  if (payload.productId) {
    const product = await queries.getProductById(payload.productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
  }

  const duplicate = await queries.getPreLaunchReservationByDuplicateKey({
    email: payload.email ?? existing.email,
    productId: payload.productId ?? existing.productId,
    productSize: payload.productSize ?? existing.productSize,
  });
  if (duplicate && duplicate.id !== existing.id) {
    return res.status(409).json({
      error: "A reservation already exists for this email, product, and size.",
    });
  }

  const updated = await queries.updatePreLaunchReservation(
    req.params.id,
    payload
  );
  if (!updated) return res.status(404).json({ error: "Reservation not found" });

  const reservation = await queries.getPreLaunchReservationById(updated.id);
  return res.status(200).json(reservation);
};

export const remove = async (req: Request, res: Response) => {
  const deleted = await queries.deletePreLaunchReservation(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Reservation not found" });
  return res.status(200).json(deleted);
};
