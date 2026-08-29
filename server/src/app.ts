// src/app.ts

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
import adminUploadRoutes from "./modules/admin/upload/routes.js";

import publicRoutes from "./modules/public/routes.js";
import webhookRoutes from "./modules/webhooks/razorpay/routes.js";

ensureUploadDirs();

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────────────────────
//
// Allow both client (3000) and admin (3001) by default in development.
//
// You can override this with:
// CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
//
const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "http://localhost:3000,http://localhost:3001"
).split(",");

app.use(
  helmet({
    // Admin (3001) loads images from the API server (4000).
    // Allow cross-origin resources such as uploaded product images.
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// RAZORPAY WEBHOOKS
// ─────────────────────────────────────────────────────────────────────────────
//
// IMPORTANT:
// Webhooks must be registered BEFORE express.json() because Razorpay
// signature verification requires access to the raw request body.
//
app.use("/api/webhooks", webhookRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// BODY PARSERS
// ─────────────────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────────────────────
// UPLOADS
// ─────────────────────────────────────────────────────────────────────────────
//
// Allow client/admin applications to load uploaded files cross-origin.
//
app.use("/uploads", (_req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH CHECKS
// ─────────────────────────────────────────────────────────────────────────────
//
// Internal/server health check:
//
// GET /health
//
// Public API health check:
//
// GET /api/health
//
// Having both makes it easy to verify the API directly and through the
// Nginx /api reverse-proxy path.
//
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN API — PROTECTED
// ─────────────────────────────────────────────────────────────────────────────

app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/admin/upload", adminUploadRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER API — SESSION BASED
// ─────────────────────────────────────────────────────────────────────────────

app.use("/api/assets", assetRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API — NO AUTHENTICATION
// ─────────────────────────────────────────────────────────────────────────────

app.use("/api", publicRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// 404 HANDLER
// ─────────────────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────────────────────────────────────

app.use(errorHandler);

export default app;