import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import * as queries from "../db/queries";
import { Parser } from "json2csv";

export const subscribe = async (req: Request, res: Response) => {
  try {
    const { email, country } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const ip = req.ip;
    const record = await queries.createNewsletterSubscription({
      email,
      country: country ? String(country).toLowerCase() : null,
      ip,
    });
    res.status(201).json(record);
  } catch (error) {
    console.error("Error subscribing to newsletter", error);
    res.status(500).json({ error: "Failed to subscribe" });
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) return res.status(401).json({ error: "Unauthorized" });

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
    const auth = getAuth(req);
    if (!auth.userId) return res.status(401).json({ error: "Unauthorized" });

    const { from, to, country, search } = req.query;
    const rows = await queries.exportNewsletterSubscriptions({
      from: from ? new Date(String(from)) : undefined,
      to: to ? new Date(String(to)) : undefined,
      country: country ? String(country) : undefined,
      search: search ? String(search) : undefined,
    });

    const parser = new Parser({ fields: ["email", "country", "ip", "createdAt"] });
    const csv = parser.parse(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("newsletter.csv");
    res.send(csv);
  } catch (error) {
    console.error("Error exporting newsletter subscriptions", error);
    res.status(500).json({ error: "Failed to export" });
  }
};
