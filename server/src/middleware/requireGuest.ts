import type { Request, Response, NextFunction } from "express";
import { getAuth } from "../lib/auth";
import * as queries from "../db/queries";

export async function requireGuest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await queries.getUserById(userId);
    if (!user || user.role !== "guest") {
      return res.status(403).json({ error: "Guest access required" });
    }

    return next();
  } catch (error) {
    console.error("Error checking guest role:", error);
    return res.status(500).json({ error: "Failed to authorize guest" });
  }
}
