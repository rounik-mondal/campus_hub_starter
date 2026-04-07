//src/routes/college.routes.js

import express from "express";
import {
  createCollege,
  listColleges,
  createCollegeAdmin,
} from "../controllers/college.controller.js";

import { protect, authorize } from "../middlewares/auth.middleware.js";
import { optionalProtect } from "../middlewares/optionalAuth.middleware.js";

const router = express.Router();

// public dropdown (optionally authenticated)
router.get("/", optionalProtect, listColleges);

// super admin only
router.post(
  "/",
  protect,
  authorize("super_admin"),
  createCollege
);

router.post(
  "/create-admin",
  protect,
  authorize("super_admin"),
  createCollegeAdmin
);

export default router;