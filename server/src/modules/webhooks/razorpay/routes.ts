import { Router, Request, Response, NextFunction } from "express";
import { razorpayWebhookHandler } from "./handler.js";

const router = Router();

// ── Raw body capture middleware ───────────────────────────────────────────
// Razorpay signature verification requires the raw request body
// This must be applied BEFORE express.json() parses the body

export const captureRawBody = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let data = "";
  req.on("data", (chunk: Buffer) => {
    data += chunk.toString();
  });
  req.on("end", () => {
    (req as any).rawBody = data;
    next();
  });
};

// POST /api/webhooks/razorpay
router.post("/razorpay", captureRawBody, razorpayWebhookHandler);

export default router;