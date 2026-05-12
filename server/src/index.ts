import "express-async-errors";
import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import compression from "compression";
import { ENV } from "./config/env";
import { cookies, authMiddleware } from "./lib/auth";
import { getLegacyUploadsDir, getUploadsDir } from "./lib/paths";
import { csrfMiddleware } from "./middleware/csrf";
import Module from "module";

// Ensure server-side deps (like argon2) resolve even if NODE_PATH isn't set by PM2.
if (!process.env.NODE_PATH) {
  process.env.NODE_PATH = path.resolve(__dirname, "../server/node_modules");
  const modAny = Module as unknown as { _initPaths?: () => void };
  modAny._initPaths?.();
}

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
import homepageRoutes from "./routes/homepageRoutes";
import { db } from "./db";
import { blogPosts, products } from "./db/schema";
import { desc, eq } from "drizzle-orm";
import * as queries from "./db/queries";
import {
  canRenderSsr,
  localizePath,
  renderSsrPage,
  shouldHandleAsHtml,
  stripLocaleFromPath,
} from "./seo/ssr";

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
// Frontend build output (Vite outDir is dist/public). Use __dirname so PM2 cwd doesn't matter.
const distPath = path.resolve(__dirname, "public");
// Keep in sync with multer destinations (middleware/upload*.ts)
const uploadsPathPrimary = getUploadsDir();
// Also serve any legacy path to avoid breaking already-uploaded assets
const uploadsPathSecondary = getLegacyUploadsDir();
const hasBuiltFrontend = fs.existsSync(path.join(distPath, "index.html"));
const isProduction = process.env.NODE_ENV === "production";
const isTsRuntime = path.extname(__filename) === ".ts"; // running via ts-node in dev
if (isProduction && !ENV.FRONTEND_URL) {
  throw new Error(
    "FRONTEND_URL environment variable is required in production"
  );
}
const allowedOrigins = (ENV.FRONTEND_URL || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);
// Permit common performance-test origins to avoid noisy CORS failures
allowedOrigins.push("https://www.google.com", "https://gtmetrix.com");
if (!allowedOrigins.length) {
  allowedOrigins.push("http://localhost:5173", "http://localhost:3000");
}
// Always allow both apex and www versions if one is provided
const expandedOrigins = new Set<string>();
for (const origin of allowedOrigins) {
  expandedOrigins.add(origin);
  try {
    const url = new URL(origin);
    const host = url.host;
    if (host.startsWith("www.")) {
      expandedOrigins.add(`${url.protocol}//${host.replace(/^www\\./, "")}`);
    } else {
      expandedOrigins.add(`${url.protocol}//www.${host}`);
    }
  } catch {
    // ignore invalid URLs in env
  }
}

app.set("trust proxy", 1);
app.use(compression());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser clients
      if (expandedOrigins.has(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin ${origin}`));
    },
    credentials: true,
  })
);
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
const uploadStaticDirs = [
  uploadsPathPrimary,
  uploadsPathSecondary,
].filter((dir, idx, arr) => arr.indexOf(dir) === idx); // dedupe

for (const dir of uploadStaticDirs) {
  if (fs.existsSync(dir)) {
    app.use(
      "/uploads",
      express.static(dir, {
        maxAge: "7d",
        immutable: false,
      })
    );
  }
}
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
app.use("/api/homepage", homepageRoutes);
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
  res.type("text/plain").send(`User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: *
Allow: /

Sitemap: ${base}/sitemap-index.xml
`);
});

const SEO_LOCALES = ["en", "fa", "ps"] as const;

type SeoLocale = (typeof SEO_LOCALES)[number];

const buildAlternateLinks = (base: string, locale: SeoLocale, path: string) =>
  SEO_LOCALES.map(
    current =>
      `<xhtml:link rel="alternate" hreflang="${current}" href="${base}${localizePath(current, path)}" />`
  )
    .concat(
      `<xhtml:link rel="alternate" hreflang="x-default" href="${base}${localizePath("en", path)}" />`
    )
    .join("");

app.get(["/sitemap.xml", "/sitemap-index.xml"], async (_req, res) => {
  try {
    const base = (ENV.FRONTEND_URL || "http://localhost:5173").replace(
      /\/+$/,
      ""
    );
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SEO_LOCALES.map(locale => `<sitemap><loc>${base}/sitemap-${locale}.xml</loc></sitemap>`).join("")}
</sitemapindex>`;
    res.type("application/xml").send(xml);
  } catch (err) {
    console.error("sitemap generation failed", err);
    res.status(500).send("<!-- sitemap error -->");
  }
});

app.get("/sitemap-:locale.xml", async (req, res) => {
  try {
    const locale = req.params.locale as SeoLocale;
    if (!SEO_LOCALES.includes(locale)) {
      return res.status(404).send("<!-- sitemap not found -->");
    }

    const base = (ENV.FRONTEND_URL || "http://localhost:5173").replace(
      /\/+$/,
      ""
    );

    const staticUrls = [
      { path: "/", changefreq: "weekly", priority: "1.0" },
      { path: "/blog", changefreq: "weekly", priority: "0.8" },
      { path: "/products", changefreq: "weekly", priority: "0.8" },
      { path: "/about", changefreq: "monthly", priority: "0.6" },
      { path: "/contact", changefreq: "monthly", priority: "0.6" },
      { path: "/gallery", changefreq: "weekly", priority: "0.5" },
      { path: "/privacy", changefreq: "yearly", priority: "0.3" },
      { path: "/terms", changefreq: "yearly", priority: "0.3" },
      { path: "/help", changefreq: "monthly", priority: "0.5" },
    ];

    const [blogList, productList] = await Promise.all([
      db
        .select({
          slug: blogPosts.slug,
          updatedAt: blogPosts.updatedAt,
          publishedAt: blogPosts.publishedAt,
        })
        .from(blogPosts)
        .where(eq(blogPosts.status, "published"))
        .orderBy(desc(blogPosts.publishedAt)),
      db
        .select({
          id: products.id,
          updatedAt: products.updatedAt,
          createdAt: products.createdAt,
        })
        .from(products)
        .orderBy(desc(products.createdAt)),
    ]);

    const escapeXml = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    type SitemapUrl = {
      loc: string;
      path: string;
      changefreq: string;
      priority: string;
      lastmod?: string;
    };

    const urls: SitemapUrl[] = [
      ...staticUrls.map(item => ({
        loc: `${base}${localizePath(locale, item.path)}`,
        path: item.path,
        changefreq: item.changefreq,
        priority: item.priority,
      })),
      ...blogList.map(post => ({
        loc: `${base}${localizePath(locale, `/blog/${post.slug}`)}`,
        path: `/blog/${post.slug}`,
        lastmod: (
          post.updatedAt ||
          post.publishedAt ||
          new Date()
        ).toISOString(),
        changefreq: "weekly",
        priority: "0.7",
      })),
      ...productList.map(product => ({
        loc: `${base}${localizePath(locale, `/products/${product.id}`)}`,
        path: `/products/${product.id}`,
        lastmod: (
          product.updatedAt ||
          product.createdAt ||
          new Date()
        ).toISOString(),
        changefreq: "monthly",
        priority: "0.7",
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    url =>
      `<url><loc>${escapeXml(url.loc)}</loc>${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}<changefreq>${url.changefreq}</changefreq><priority>${url.priority}</priority>${buildAlternateLinks(base, locale, url.path)}</url>`
  )
  .join("")}
</urlset>`;

    res.type("application/xml").send(xml);
  } catch (error) {
    console.error("localized sitemap generation failed", error);
    res.status(500).send("<!-- sitemap error -->");
  }
});

// Serve built client assets / SSR pages in production (only if build exists)
if (ENV.NODE_ENV === "production" && hasBuiltFrontend) {
  app.get(/.*/, async (req, res, next) => {
    if (!shouldHandleAsHtml(req.path)) {
      return next();
    }

    const route = stripLocaleFromPath(req.path);
    if (route.hadLocalePrefix && route.locale === "en") {
      const target = localizePath(route.locale, route.pathname);
      const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
      return res.redirect(308, `${target}${query}`);
    }

    if (!canRenderSsr(route.pathname)) {
      return res.sendFile(path.join(distPath, "index.html"));
    }

    const origin = (ENV.FRONTEND_URL || `${req.protocol}://${req.get("host")}`)
      .split(",")[0]
      .trim()
      .replace(/\/+$/, "");

    try {
      const rendered = await renderSsrPage({
        distPath,
        locale: route.locale,
        pathname: route.pathname,
        origin,
      });
      res.status(rendered.statusCode).send(rendered.html);
    } catch (error) {
      console.error("SSR render failed", error);
      res.sendFile(path.join(distPath, "index.html"));
    }
  });
}
if (ENV.NODE_ENV === "development") {
  console.log("Hey donkey, you are developing I mean in development mode!");
}
app.listen(ENV.PORT, () =>
  console.log("Server is up and running on port:", ENV.PORT)
);
