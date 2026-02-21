import "express-async-errors";
import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import compression from "compression";
import { ENV } from "./config/env";
import { cookies, authMiddleware } from "./lib/auth";
import { csrfMiddleware } from "./middleware/csrf";

import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import commentRoutes from "./routes/commentRoutes";
import galleryRoutes from "./routes/galleryRoutes";
import blogRoutes from "./routes/blogRoutes";
import contentRoutes from "./routes/contentRoutes";
import mediaRoutes from "./routes/mediaRoutes";
import contactRoutes from "./routes/contactRoutes";
import newsletterRoutes from "./routes/newsletterRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import authRoutes from "./routes/authRoutes";
import { db } from "./db";
import { blogPosts, products } from "./db/schema";
import { desc, eq } from "drizzle-orm";
import * as queries from "./db/queries";

// Periodic cleanup of expired sessions (once per hour)
setInterval(
  () => {
    queries
      .deleteExpiredSessions()
      .catch(err => console.error("cleanup expired sessions failed", err));
  },
  60 * 60 * 1000
);

const app = express();
// Frontend build output (Vite outDir is dist/public relative to repo root)
const distPath = path.resolve(process.cwd(), "dist", "public");
const uploadsPath = path.resolve(process.cwd(), "server", "uploads");
const hasBuiltFrontend = fs.existsSync(path.join(distPath, "index.html"));
const isProduction = process.env.NODE_ENV === "production";
const isTsRuntime = path.extname(__filename) === ".ts"; // running via ts-node in dev
if (isProduction && !ENV.FRONTEND_URL) {
  throw new Error(
    "FRONTEND_URL environment variable is required in production"
  );
}
const allowedOrigin = ENV.FRONTEND_URL || "http://localhost:5173";
app.set("trust proxy", 1);
app.use(compression());
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(cookies);
app.use(csrfMiddleware);
// Serve static assets early, with caching (only if build exists)
if (hasBuiltFrontend) {
  app.use(
    express.static(distPath, {
      maxAge: "1y",
      immutable: true,
      index: false,
    })
  );
} else if (isProduction && !isTsRuntime) {
  // In production we expect a built frontend; fail fast for clearer diagnosis
  throw new Error(
    `Frontend build not found at ${distPath}. Did you run "pnpm build"?`
  );
} else {
  console.warn(
    `[dev] Frontend build not found at ${distPath}. Static middleware disabled; use Vite dev server for the client.`
  );
}
// serve uploaded assets (Render uses ephemeral FS; consider S3 if you need persistence)
app.use(
  "/uploads",
  express.static(uploadsPath, {
    maxAge: "7d",
    immutable: false,
  })
);
app.use(authMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/test", (req, res) => {
  res.json({ success: true });
});

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);

// Periodic cleanup of expired sessions/tokens (once per hour best-effort)
let lastCleanup = 0;
app.use((_req, _res, next) => {
  const now = Date.now();
  if (now - lastCleanup > 60 * 60 * 1000) {
    lastCleanup = now;
    queries
      .deleteExpiredSessions()
      .catch(err => console.error("cleanup expired sessions failed", err));
  }
  next();
});

// --------------------
// robots.txt
// --------------------
app.get("/robots.txt", (_req, res) => {
  const base = (ENV.FRONTEND_URL || "http://localhost:5173").replace(
    /\/+$/,
    ""
  );
  res.type("text/plain").send(`User-agent: *
Allow: /
Sitemap: ${base}/sitemap.xml
`);
});

// --------------------
// sitemap.xml (simple)
// --------------------
app.get("/sitemap.xml", async (_req, res) => {
  try {
    const base = (ENV.FRONTEND_URL || "http://localhost:5173").replace(
      /\/+$/,
      ""
    );

    const staticUrls = [
      "",
      "/blog",
      "/products",
      "/about",
      "/contact",
      "/gallery",
      "/privacy",
      "/terms",
      "/help",
    ];

    const blogList = await db
      .select({
        slug: blogPosts.slug,
        updatedAt: blogPosts.updatedAt,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .orderBy(desc(blogPosts.publishedAt));

    const productList = await db
      .select({
        id: products.id,
        updatedAt: products.updatedAt,
        createdAt: products.createdAt,
      })
      .from(products)
      .orderBy(desc(products.createdAt));

    type UrlEntry = {
      loc: string;
      changefreq: string;
      priority: string;
      lastmod?: string;
    };

    const urls: UrlEntry[] = [
      ...staticUrls.map(path => ({
        loc: `${base}${path}`,
        changefreq: "weekly",
        priority: path === "" ? "1.0" : "0.6",
      })),
      ...blogList.map(post => ({
        loc: `${base}/blog/${post.slug}`,
        lastmod: (
          post.updatedAt ||
          post.publishedAt ||
          new Date()
        ).toISOString(),
        changefreq: "weekly",
        priority: "0.7",
      })),
      ...productList.map(p => ({
        loc: `${base}/products/${p.id}`,
        lastmod: (p.updatedAt || p.createdAt || new Date()).toISOString(),
        changefreq: "monthly",
        priority: "0.6",
      })),
    ];

    const escapeXml = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    u =>
      `<url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
  )
  .join("")}
</urlset>`;

    res.type("application/xml").send(xml);
  } catch (err) {
    console.error("sitemap generation failed", err);
    res.status(500).send("<!-- sitemap error -->");
  }
});

// Serve built client assets in production (only if build exists)
if (ENV.NODE_ENV === "production" && hasBuiltFrontend) {
  app.get(/.*/, (_req, res) => res.sendFile(path.join(distPath, "index.html")));
}
if (ENV.NODE_ENV === "development") {
  console.log("Hey donkey, you are developing I mean in development mode!");
}
app.listen(ENV.PORT, () =>
  console.log("Server is up and running on port:", ENV.PORT)
);
