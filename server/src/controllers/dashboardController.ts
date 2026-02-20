import type { Request, Response } from "express";
import * as queries from "../db/queries";

export const getStats = async (_req: Request, res: Response) => {
  try {
    const stats = await queries.getDashboardStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// Clears browser caches for the origin by sending the Clear-Site-Data header.
// Note: This does not purge CDN caches; use CDN dashboard for that.
export const clearCache = async (req: Request, res: Response) => {
  const xfProto = (req.headers["x-forwarded-proto"] as string | undefined)?.split(
    ","
  )[0]?.trim();
  const isLocalhost =
    req.hostname === "localhost" ||
    req.hostname === "127.0.0.1" ||
    req.ip === "::1";
  const isSecure = req.secure || req.protocol === "https" || xfProto === "https" || isLocalhost;

  if (isSecure) {
    res.setHeader("Clear-Site-Data", '"cache"');
  }

  res.status(200).json({
    cleared: Boolean(isSecure),
    at: new Date().toISOString(),
    note:
      "Clears cache only for the browser that made this request (admin) on this API origin; does not affect other users or CDN/edge caches.",
  });
};
