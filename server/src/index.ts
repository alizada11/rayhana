import exprss from "express";
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

const app = exprss();
const allowedOrigin = ENV.FRONTEND_URL || "http://localhost:5173";
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(clerkMiddleware());
app.use(exprss.json());
app.use(exprss.urlencoded({ extended: true }));
app.use("/uploads", exprss.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.json({ success: true });
});

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/media", mediaRoutes);

app.listen(ENV.PORT, () =>
  console.log("Server is up and running on port:", ENV.PORT)
);
