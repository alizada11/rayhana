import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import * as queries from "../db/queries";

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await queries.getUserById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    return next();
  } catch (error) {
    console.error("Error checking admin role:", error);
    return res.status(500).json({ error: "Failed to authorize admin" });
  }
}
