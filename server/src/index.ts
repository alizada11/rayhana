import express from "express";
import path from "path";
import cors from "cors";
import compression from "compression";
import { ENV } from "./config/env";
import { cookies, authMiddleware } from "./lib/auth";

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

const app = express();
const distPath = path.join(__dirname, "..", "dist", "public");
const uploadsPath = path.resolve(process.cwd(), "server", "uploads");
const isProduction = process.env.NODE_ENV === "production";
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
// Serve static assets early, with caching
app.use(
  express.static(distPath, {
    maxAge: "1y",
    immutable: true,
    index: false,
  })
);
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

// Serve built client assets in production
if (ENV.NODE_ENV === "production") {
  app.get(/.*/, (req, res) => res.sendFile(path.join(distPath, "index.html")));
}
if (ENV.NODE_ENV === "development") {
  console.log("Hey donkey, you are developing I mean in development mode!");
}
app.listen(ENV.PORT, () =>
  console.log("Server is up and running on port:", ENV.PORT)
);
