import fs from "fs";
import path from "path";

const looksLikeRepoRoot = (dir: string) =>
  fs.existsSync(path.join(dir, "package.json")) &&
  fs.existsSync(path.join(dir, "client")) &&
  fs.existsSync(path.join(dir, "server"));

export const resolveRepoRoot = () => {
  const cwd = process.cwd();
  if (looksLikeRepoRoot(cwd)) return cwd;

  const parent = path.resolve(cwd, "..");
  if (looksLikeRepoRoot(parent)) return parent;

  return cwd;
};

export const getUploadsDir = () => {
  const dir = path.resolve(resolveRepoRoot(), "uploads");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// Temporary compatibility: still serve legacy path where some older deployments stored files.
export const getLegacyUploadsDir = () =>
  path.resolve(resolveRepoRoot(), "server", "uploads");

export const resolveUploadUrlToPath = (url: string) => {
  const relative = url.replace(/^\/+uploads\/?/, "");
  return path.resolve(getUploadsDir(), relative);
};
