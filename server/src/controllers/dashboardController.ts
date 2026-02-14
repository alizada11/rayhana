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
