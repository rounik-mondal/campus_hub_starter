// src/routes/event.routes.js

import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventParticipants,
  getParticipantCount
} from "../controllers/event.controller.js";

import { protect, authorize } from "../middlewares/auth.middleware.js";
import { optionalProtect } from "../middlewares/optionalAuth.middleware.js";

const router = express.Router();


// PUBLIC / OPTIONAL AUTH ROUTES
router.get("/", optionalProtect, getAllEvents);
router.get("/:id", optionalProtect, getEventById);


// CREATE EVENT
router.post(
  "/",
  protect,
  authorize("college_admin", "super_admin"),
  createEvent
);


// UPDATE EVENT
router.put(
  "/:id",
  protect,
  authorize("college_admin", "super_admin"), // UPDATED
  updateEvent
);


// DELETE EVENT
router.delete(
  "/:id",
  protect,
  authorize("college_admin", "super_admin"), // UPDATED
  deleteEvent
);


// GET EVENT PARTICIPANTS
router.get(
  "/:id/participants",
  protect,
  authorize("college_admin", "super_admin"), // UPDATED
  getEventParticipants
);


// GET PARTICIPANT COUNT
router.get(
  "/:id/participants/count",
  protect,
  authorize("college_admin", "super_admin"), // UPDATED
  getParticipantCount
);


export default router;