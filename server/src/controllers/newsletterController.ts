import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import * as queries from "../db/queries";
import { Parser } from "@json2csv/plainjs";

const isAdminUser = async (userId?: string | null) => {
  if (!userId) return false;
  const user = await queries.getUserById(userId);
  return user?.role === "admin";
};

export const subscribe = async (req: Request, res: Response) => {
  try {
    const { email, country } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await queries.getNewsletterSubscriptionByEmail(normalizedEmail);
    if (existing) {
      return res
        .status(200)
        .json({ message: "You already subscribed. Thanks for your interest!" });
    }
    // NOTE: We intentionally do not persist raw requester IPs from req.ip to respect GDPR/CCPA.
    // Any IP handling must stay anonymized per our privacy policy.
    const record = await queries.createNewsletterSubscription({
      email: normalizedEmail,
      country: country ? String(country).toLowerCase() : null,
      ip: null,
    });
    res.status(201).json(record);
  } catch (error) {
    console.error("Error subscribing to newsletter", error);
    res.status(500).json({ error: "Failed to subscribe" });
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const isAdmin = await isAdminUser(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { from, to, country, search, limit = 20, cursor } = req.query;
    const result = await queries.listNewsletterSubscriptions({
      from: from ? new Date(String(from)) : undefined,
      to: to ? new Date(String(to)) : undefined,
      country: country ? String(country) : undefined,
      search: search ? String(search) : undefined,
      limit: Math.min(Number(limit) || 20, 200),
      cursorId: cursor ? String(cursor) : undefined,
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error listing newsletter subscriptions", error);
    res.status(500).json({ error: "Failed to list subscriptions" });
  }
};

export const exportCsv = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const isAdmin = await isAdminUser(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { from, to, country, search } = req.query;
    const rows = await queries.exportNewsletterSubscriptions({
      from: from ? new Date(String(from)) : undefined,
      to: to ? new Date(String(to)) : undefined,
      country: country ? String(country) : undefined,
      search: search ? String(search) : undefined,
    });

    // Export excludes raw IPs to avoid distributing personal data; see privacy policy.
    const parser = new Parser({ fields: ["email", "country", "createdAt"] });
    const csv = parser.parse(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("newsletter.csv");
    res.send(csv);
  } catch (error) {
    console.error("Error exporting newsletter subscriptions", error);
    res.status(500).json({ error: "Failed to export" });
  }
};
