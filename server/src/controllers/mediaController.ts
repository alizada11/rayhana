import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";
import fs from "fs";
import path from "path";

const getParam = (value: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const getImageSize = async (filePath: string) => {
  try {
    const { readFileSync } = await import("fs");
    const buffer = readFileSync(filePath);
    if (buffer.length > 24 && buffer.toString("ascii", 1, 4) === "PNG") {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }
    if (buffer.length > 10 && buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset + 4 <= buffer.length) {
        const marker = buffer.readUInt16BE(offset);
        offset += 2;
        const size = buffer.readUInt16BE(offset);
        if (marker >= 0xffc0 && marker <= 0xffcf && marker !== 0xffc4) {
          if (offset + 5 > buffer.length) break;
          offset += 3;
          const height = buffer.readUInt16BE(offset);
          const width = buffer.readUInt16BE(offset + 2);
          return { width, height };
        }
        if (offset + size > buffer.length) break;
        offset += size;
      }
    }
    return { width: null, height: null };
  } catch {
    return { width: null, height: null };
  }
};

// POST /api/media (admin)
export const uploadMedia = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    const url = `/uploads/${req.file.filename}`;
    const fullPath = path.join(process.cwd(), "uploads", req.file.filename);
    const { width, height } = await getImageSize(fullPath);

    const asset = await queries.createMediaAsset({
      url,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      width: width ?? undefined,
      height: height ?? undefined,
      userId,
    });

    res.status(201).json(asset);
  } catch (error) {
    console.error("Error uploading media:", error);
    res.status(500).json({ error: "Failed to upload media" });
  }
};

// GET /api/media (admin)
export const listMedia = async (req: Request, res: Response) => {
  try {
    const { limit = 24, cursor } = req.query;
    const pageSize = Math.min(Number(limit) || 24, 100);
    const result = await queries.getMediaAssetsPaged({
      limit: pageSize,
      cursorId: cursor ? String(cursor) : undefined,
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error listing media:", error);
    res.status(500).json({ error: "Failed to list media" });
  }
};

// DELETE /api/media/:id (admin)
export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const id = getParam(req.params.id);
    const asset = await queries.deleteMediaAsset(id);
    if (!asset) return res.status(404).json({ error: "Not found" });

    if (asset.url?.startsWith("/uploads/")) {
      const relativeUrl = asset.url.replace(/^\/+/, "");
      const imgPath = path.join(process.cwd(), relativeUrl);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    res.status(200).json({ message: "Media deleted" });
  } catch (error) {
    console.error("Error deleting media:", error);
    res.status(500).json({ error: "Failed to delete media" });
  }
};
