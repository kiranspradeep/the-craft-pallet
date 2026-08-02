import { Router, Request, Response, NextFunction } from "express";
import { razorpayWebhookHandler } from "./handler.js";

const router = Router();

// ── Raw body capture + JSON parse for Razorpay webhook ─────────────────
// We need the raw body for signature verification AND parsed JSON for logic

export const captureRawBody = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  let data = "";
  req.setEncoding("utf8");

  req.on("data", (chunk: string) => {
    data += chunk;
  });

  req.on("end", () => {
    (req as any).rawBody = data;
    try {
      req.body = data ? JSON.parse(data) : {};
    } catch {
      req.body = {};
    }
    next();
  });

  req.on("error", (err) => {
    next(err);
  });
};

// POST /api/webhooks/razorpay
router.post("/razorpay", captureRawBody, razorpayWebhookHandler);

export default router;