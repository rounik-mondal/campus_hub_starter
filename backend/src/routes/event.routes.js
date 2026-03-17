// src/routes/event.routes.js

import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
} from "../controllers/event.controller.js";

import { verifyAuth, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 🌍 public but role-aware
router.get("/", verifyAuth, getAllEvents);
router.get("/:id", verifyAuth, getEventById);

// 🛡️ admin only
router.post(
  "/",
  verifyAuth,
  authorize("college_admin", "super_admin"),
  createEvent
);

export default router;