import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./shared/logger/index.js";
import { ensureUploadDirs } from "./shared/utils/storage.js";
import authRoutes from "./modules/admin/auth/routes.js";
import categoryRoutes from "./modules/admin/category/routes.js";
import productRoutes from "./modules/admin/product/routes.js";
import orderRoutes from "./modules/admin/order/routes.js";
import settingsRoutes from "./modules/admin/settings/routes.js";
import assetRoutes from "./modules/asset/routes.js";
import cartRoutes from "./modules/cart/routes.js";
import checkoutRoutes from "./modules/checkout/routes.js";
import publicRoutes from "./modules/public/routes.js";

ensureUploadDirs();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Admin (protected) ──────────────────────────────────────────────────────
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/settings", settingsRoutes);

// ── Customer (session-based) ───────────────────────────────────────────────
app.use("/api/assets", assetRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);

// ── Public (no auth) ───────────────────────────────────────────────────────
app.use("/api", publicRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

export default app;