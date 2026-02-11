import express from "express";
import path from "path";
import cors from "cors";
import { ENV } from "./config/env";
import { clerkMiddleware } from "@clerk/express";

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

const app = express();
const distPath = path.join(process.cwd(), "dist");
const isProduction = process.env.NODE_ENV === "production";
if (isProduction && !ENV.FRONTEND_URL) {
  throw new Error(
    "FRONTEND_URL environment variable is required in production"
  );
}
const allowedOrigin = ENV.FRONTEND_URL || "http://localhost:5173";
app.set("trust proxy", 1);
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(clerkMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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

// Serve built client assets in production
if (ENV.NODE_ENV === "production") {
  const __dirname = path.resolve();

  // serve static files from frontend/dist
  app.use(express.static(path.join(__dirname, "../dist")));

  // handle SPA routing - send all non-API routes to index.html - react app
  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
}
if (ENV.NODE_ENV === "development") {
  console.log("Hey donkey, you are developing I mean in development mode!");
}
app.listen(ENV.PORT, () =>
  console.log("Server is up and running on port:", ENV.PORT)
);
