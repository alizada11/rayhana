import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "../lib/auth";
import fs from "fs";
import {
  getLegacyUploadsDir,
  getUploadsDir,
  resolveUploadUrlToPath,
} from "../lib/paths";
import path from "path";

function deleteUploadIfExists(url?: string) {
  if (!url || !url.startsWith("/uploads/")) return;

  try {
    const primary = resolveUploadUrlToPath(url);

    const uploadsDir = getUploadsDir();

    // Prevent path traversal
    if (!primary.startsWith(uploadsDir + path.sep)) return;

    if (fs.existsSync(primary)) {
      fs.unlinkSync(primary);
      return;
    }

    const legacyDir = getLegacyUploadsDir();
    const legacy = path.resolve(legacyDir, url.replace(/^\/+uploads\/?/, ""));
    if (!legacy.startsWith(legacyDir + path.sep)) return;
    if (fs.existsSync(legacy)) fs.unlinkSync(legacy);
  } catch (err) {
    console.warn?.("deleteUploadIfExists failed", { url, err });
  }
}
const getId = (rawId: string | string[]) =>
  Array.isArray(rawId) ? rawId[0] : rawId;

export const getApprovedGallery = async (_req: Request, res: Response) => {
  try {
    const { userId } = getAuth(_req);
    const submissions = await queries.getApprovedGallerySubmissions();

    // Always expose sender metadata publicly (name/email/id only)
    const publicSubmissions = submissions.map(s => {
      const user = s.user
        ? {
            id: s.user.id,
            name: s.user.name,
            email: s.user.email,
          }
        : null;
      return {
        ...s,
        user,
        submittedBy: user?.name || user?.email || "Guest",
      };
    });

    if (!userId) {
      return res.status(200).json(publicSubmissions);
    }

    const likes = await queries.getGalleryLikesByUserId(userId);
    const likedSet = new Set(likes.map(l => l.submissionId));
    const enriched = publicSubmissions.map(s => ({
      ...s,
      viewerHasLiked: likedSet.has(s.id),
    }));

    res.status(200).json(enriched);
  } catch (error) {
    console.error("Error getting gallery submissions:", error);
    res.status(500).json({ error: "Failed to get gallery submissions" });
  }
};

export const getAllGallery = async (_req: Request, res: Response) => {
  try {
    const submissions = await queries.getAllGallerySubmissions();
    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error getting all gallery submissions:", error);
    res.status(500).json({ error: "Failed to get gallery submissions" });
  }
};

export const getMyGallery = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const submissions = await queries.getGallerySubmissionsByUserId(userId);
    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error getting my gallery submissions:", error);
    res.status(500).json({ error: "Failed to get submissions" });
  }
};

export const createGallerySubmission = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { dishName, description } = req.body;
    const uploadedImageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : undefined;

    if (!dishName || !uploadedImageUrl) {
      return res
        .status(400)
        .json({ error: "Dish name and image are required" });
    }

    const submission = await queries.createGallerySubmission({
      dishName,
      description,
      imageUrl: uploadedImageUrl,
      userId,
      status: "pending",
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error("Error creating gallery submission:", error);
    res.status(500).json({ error: "Failed to submit photo" });
  }
};

export const approveGallerySubmission = async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const submission = await queries.updateGallerySubmissionStatus(
      id,
      "approved"
    );
    if (!submission) return res.status(404).json({ error: "Not found" });
    res.status(200).json(submission);
  } catch (error) {
    console.error("Error approving gallery submission:", error);
    res.status(500).json({ error: "Failed to approve submission" });
  }
};

export const rejectGallerySubmission = async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const submission = await queries.updateGallerySubmissionStatus(
      id,
      "rejected"
    );
    if (!submission) return res.status(404).json({ error: "Not found" });
    res.status(200).json(submission);
  } catch (error) {
    console.error("Error rejecting gallery submission:", error);
    res.status(500).json({ error: "Failed to reject submission" });
  }
};

export const deleteGallerySubmission = async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const submission = await queries.deleteGallerySubmission(id);
    if (!submission) return res.status(404).json({ error: "Not found" });

    deleteUploadIfExists(submission.imageUrl);

    res.status(200).json({ message: "Submission deleted" });
  } catch (error) {
    console.error("Error deleting gallery submission:", error);
    res.status(500).json({ error: "Failed to delete submission" });
  }
};

export const deleteMyGallerySubmission = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const id = getId(req.params.id);
    const submission = await queries.getGallerySubmissionsByUserId(userId);
    const isOwner = submission.some(s => s.id === id);
    if (!isOwner) return res.status(403).json({ error: "Not allowed" });

    const deleted = await queries.deleteGallerySubmission(id);
    if (!deleted) return res.status(404).json({ error: "Not found" });

    deleteUploadIfExists(deleted.imageUrl);

    res.status(200).json({ message: "Submission deleted" });
  } catch (error) {
    console.error("Error deleting my gallery submission:", error);
    res.status(500).json({ error: "Failed to delete submission" });
  }
};

export const toggleLike = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const id = getId(req.params.id);
    const result = await queries.toggleGalleryLike(id, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
};

export const getGalleryLikes = async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const limitParam = Number(req.query.limit) || 50;
    const limit = Math.min(Math.max(1, limitParam), 100); // clamp 1..100
    const cursor = (req.query.cursor as string | undefined) || null;

    const likes = await queries.getGalleryLikesBySubmissionId(
      id,
      limit,
      cursor
    );
    res.status(200).json(likes);
  } catch (error) {
    console.error("Error getting gallery likes:", error);
    res.status(500).json({ error: "Failed to get likes" });
  }
};
