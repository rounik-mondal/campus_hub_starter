// src/routes/analytics.routes.js
import { Router } from "express";
import { getPlatformAnalytics } from "../controllers/analytics.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyAuth);
router.get("/platform", getPlatformAnalytics);

export default router;
