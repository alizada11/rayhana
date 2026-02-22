import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "../lib/auth";
import { createHash } from "crypto";

const getParam = (value: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

// GET /api/content/:key (public)
export const getContentByKey = async (req: Request, res: Response) => {
  try {
    const key = getParam(req.params.key);
    const content = await queries.getSiteContentByKey(key);
    if (!content) {
      return res.status(200).json({ key, data: {}, updatedAt: null });
    }
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

    // Validate GA measurement ID when saving settings content.
    // Allow it to be omitted or left empty so setup can be deferred.
    if (key === "settings") {
      const gaRegex = /^G-[A-Z0-9]{6,12}$/;

      if (data.gaMeasurementId !== undefined) {
        const gaId = String(data.gaMeasurementId ?? "").trim();

        // Only validate when a value is supplied; empty strings mean "not configured".
        if (gaId && !gaRegex.test(gaId)) {
          return res
            .status(400)
            .json({ error: "Invalid Google Analytics Measurement ID" });
        }

        // Persist empty as null to keep payload clean.
        data.gaMeasurementId = gaId || null;
      }

      if (data.gscVerification !== undefined) {
        data.gscVerification =
          String(data.gscVerification ?? "").trim() || null;
      }
    }

    const saved = await queries.upsertSiteContent({ key, data });
    res.status(200).json(saved);
  } catch (error) {
    console.error("Error saving content:", error);
    res.status(500).json({ error: "Failed to save content" });
  }
};

// GET /api/homepage (public aggregated payload)
export const getHomepage = async (_req: Request, res: Response) => {
  try {
    const payload = await queries.getHomepageBundle();
    // weak ETag to allow quick 304s
    const etag = `"${createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 32)}"`;
    const ifNoneMatch = _req.headers["if-none-match"];
    if (
      ifNoneMatch === "*" ||
      (ifNoneMatch ?? "")
        .split(",")
        .map(v => v.trim())
        .includes(etag)
    ) {
      return res.status(304).end();
    }
    res
      .set({
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        ETag: etag,
      })
      .json(payload);
  } catch (error) {
    console.error("Error fetching homepage bundle:", error);
    res.status(500).json({ error: "Failed to fetch homepage" });
  }
};
