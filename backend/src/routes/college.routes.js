//src/routes/college.routes.js

import express from "express";
import {
  createCollege,
  listColleges,
  createCollegeAdmin,
  listCollegeAdmins,
} from "../controllers/college.controller.js";

import { verifyAuth, authorize } from "../middlewares/auth.middleware.js";
import { optionalProtect } from "../middlewares/optionalAuth.middleware.js";

const router = express.Router();

// public dropdown (optionally authenticated)
router.get("/", optionalProtect, listColleges);

// super admin only
router.post(
  "/",
  verifyAuth,
  authorize("super_admin"),
  createCollege
);

router.get(
  "/get-admin",
  verifyAuth,
  authorize("super_admin"),
  listCollegeAdmins
);

router.post(
  "/create-admin",
  verifyAuth,
  authorize("super_admin"),
  createCollegeAdmin
);

export default router;