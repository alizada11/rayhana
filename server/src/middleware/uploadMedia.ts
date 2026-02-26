import multer from "multer";
import path from "path";
import { getUploadsDir } from "../lib/paths";

// Keep uploads aligned with static serving in server/src/index.ts
const uploadsDir = getUploadsDir();

const MAX_MEDIA_SIZE_BYTES = 20 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "");
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${base}-${unique}${ext}`);
  },
});

export const uploadMedia = multer({
  storage,
  limits: {
    fileSize: MAX_MEDIA_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");
    if (!isImage && !isVideo) {
      cb(new Error("Only image or video uploads are allowed"));
      return;
    }
    cb(null, true);
  },
});
