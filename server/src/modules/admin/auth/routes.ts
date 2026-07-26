import { Router } from "express";
import { authController } from "./controller";
import { authenticateAdmin } from "./middleware";
import { validate } from "../../../shared/validators/validate";
import { loginSchema } from "./validator";

const router = Router();

// Public
router.post("/login", validate(loginSchema), authController.login);

// Protected
router.post("/logout", authenticateAdmin, authController.logout);
router.get("/me", authenticateAdmin, authController.me);

export default router;