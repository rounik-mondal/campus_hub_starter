// src/routes/event.routes.js

import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
} from "../controllers/event.controller.js";

import { protect, authorize } from "../middlewares/auth.middleware.js";
import { optionalProtect } from "../middlewares/optionalAuth.middleware.js";

const router = express.Router();

// 🌍 public but role-aware
router.get("/", optionalProtect, getAllEvents);
router.get("/:id", optionalProtect, getEventById);

// 🛡️ admin only
router.post(
  "/",
  protect,
  authorize("college_admin", "super_admin"),
  createEvent
);

export default router;