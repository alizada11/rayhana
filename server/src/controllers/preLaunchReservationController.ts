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

async function sendCustomerReservationEmail(
  reservation: any,
  createdGuestUser?: any | null
) {
  const productTitle = localizeProductTitle(reservation.product);
  const baseUrl = getFrontendBase();
  const logoUrl = `${baseUrl}/images/logo.png`;
  const loginUrl = `${baseUrl}/login`;
  let accountBlock = "";

  if (createdGuestUser) {
    const [{ token: verifyToken, expiresAt }, { token: resetToken }] =
      await Promise.all([
        issueEmailVerificationToken(createdGuestUser.id),
        issuePasswordResetToken(createdGuestUser.id),
      ]);

    const verifyUrl = `${baseUrl}/verify-email?token=${verifyToken}`;
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    accountBlock = `
      <tr>
        <td style="padding: 0 28px 28px;">
          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;padding:18px;">
            <p style="margin:0 0 10px;color:#9a3412;font-size:14px;font-weight:700;">Manage your reservation</p>
            <p style="margin:0 0 14px;color:#57534e;font-size:14px;line-height:1.6;">We created a Rayhana account for this email so you can manage your reservation later.</p>
            <p style="margin:0 0 12px;">
              <a href="${escapeHtml(verifyUrl)}" style="display:inline-block;background:#b91c1c;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:10px;font-size:14px;font-weight:700;">Verify email</a>
              <a href="${escapeHtml(resetUrl)}" style="display:inline-block;margin-left:8px;background:#ffffff;color:#b91c1c;text-decoration:none;padding:9px 13px;border-radius:10px;border:1px solid #fecaca;font-size:14px;font-weight:700;">Set password</a>
            </p>
            <p style="margin:0;color:#78716c;font-size:12px;">Verification link expires at ${escapeHtml(expiresAt.toISOString())}.</p>
          </div>
        </td>
      </tr>`;
  }

  await sendContactEmail({
    to: reservation.email,
    from: ENV.SMTP_FROM_EMAIL || "no-reply@rayhana.com",
    subject: "Your Rayhana 15% discount is reserved",
    html: `<!doctype html>
<html>
  <body style="margin:0;background:#f6f1eb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f1eb;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 48px rgba(120,53,15,.14);">
            <tr>
              <td align="center" style="background:#7f1d1d;padding:28px 24px;">
                <img src="${escapeHtml(logoUrl)}" alt="Rayhana" width="84" style="display:block;margin:0 auto 14px;border-radius:14px;">
                <p style="margin:0;color:#fecaca;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Pre-launch reservation</p>
                <h1 style="margin:10px 0 0;color:#ffffff;font-family:Georgia,serif;font-size:30px;line-height:1.2;">Your 15% discount is reserved</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 18px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#374151;">Hi ${escapeHtml(reservation.fullName)},</p>
                <p style="margin:0;font-size:16px;line-height:1.7;color:#374151;">Thank you for reserving your Rayhana pre-launch offer. We saved your spot and will email your personal discount code when Amazon EU and UK launch goes live.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:16px;">
                  <tr>
                    <td style="padding:18px;border-bottom:1px solid #fecaca;color:#991b1b;font-weight:700;">Reservation details</td>
                  </tr>
                  <tr>
                    <td style="padding:18px;">
                      <p style="margin:0 0 10px;font-size:14px;color:#4b5563;"><strong style="color:#111827;">Product:</strong> ${escapeHtml(productTitle)}</p>
                      <p style="margin:0 0 10px;font-size:14px;color:#4b5563;"><strong style="color:#111827;">Size:</strong> ${escapeHtml(reservation.productSize)}</p>
                      <p style="margin:0 0 10px;font-size:14px;color:#4b5563;"><strong style="color:#111827;">Region:</strong> ${escapeHtml(reservation.region)}</p>
                      <p style="margin:0;font-size:14px;color:#4b5563;"><strong style="color:#111827;">WhatsApp:</strong> ${escapeHtml(reservation.whatsapp)}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 24px;">
                <div style="background:#f9fafb;border-radius:16px;padding:18px;">
                  <p style="margin:0 0 10px;color:#111827;font-size:15px;font-weight:700;">What happens next?</p>
                  <p style="margin:0 0 8px;color:#4b5563;font-size:14px;line-height:1.6;">1. We launch on Amazon EU and UK.</p>
                  <p style="margin:0 0 8px;color:#4b5563;font-size:14px;line-height:1.6;">2. You receive your personal 15% discount code by email.</p>
                  <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.6;">3. You use the code on our Amazon listing to claim your discount.</p>
                </div>
              </td>
            </tr>
            ${accountBlock}
            <tr>
              <td align="center" style="padding:0 28px 32px;">
                <a href="${escapeHtml(loginUrl)}" style="display:inline-block;background:#b91c1c;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:999px;font-size:14px;font-weight:700;">Visit Rayhana</a>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;color:#9ca3af;font-size:12px;">Rayhana Kitchen Appliance</p>
        </td>
      </tr>
    </table>
  </body>
</html>`,
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
    sendCustomerReservationEmail(reservationWithProduct, createdGuestUser),
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
