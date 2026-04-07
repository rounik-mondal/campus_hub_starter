// src/routes/admin.routes.js

import express from "express";
import { getPlatformOverview } from "../controllers/admin.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();


// SUPER ADMIN PLATFORM OVERVIEW
router.get(
  "/overview",
  protect,
  authorize("super_admin"),
  getPlatformOverview
);


export default router;