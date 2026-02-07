import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

const getParam = (value: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

// GET /api/content/:key (public)
export const getContentByKey = async (req: Request, res: Response) => {
  try {
    const key = getParam(req.params.key);
    const content = await queries.getSiteContentByKey(key);
    if (!content) return res.status(404).json({ error: "Not found" });
    res.status(200).json(content);
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ error: "Failed to fetch content" });
  }
};

// GET /api/content (admin)
export const getAllContent = async (_req: Request, res: Response) => {
  try {
    const content = await queries.getAllSiteContent();
    res.status(200).json(content);
  } catch (error) {
    console.error("Error fetching content list:", error);
    res.status(500).json({ error: "Failed to fetch content" });
  }
};

// PUT /api/content/:key (admin)
export const upsertContent = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const key = getParam(req.params.key);
    const data = req.body;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return res.status(400).json({ error: "Content payload is required" });
    }

    const saved = await queries.upsertSiteContent({ key, data });
    res.status(200).json(saved);
  } catch (error) {
    console.error("Error saving content:", error);
    res.status(500).json({ error: "Failed to save content" });
  }
};
