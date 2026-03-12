import express from "express";

import {
  registerForEvent,
  getMyRegistrations,
  updateRegistrationStatus,
  getEventParticipants,
  getPlatformEvents,
  deleteEvent
} from "../controllers/registration.controller.js";

import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

/*
  Student Registration
  Endpoint: POST /api/registrations/event/:eventId
*/
router.post(
  "/event/:eventId",
  protect,
  authorize("student"),
  registerForEvent
);

/*
  Student View Registrations
  Endpoint: GET /api/registrations/me
*/
router.get(
  "/me",
  protect,
  authorize("student"),
  getMyRegistrations
);

/*
  Admin View Participants
  Endpoint: GET /api/registrations/event/:eventId/participants
*/
router.get(
  "/event/:eventId/participants",
  protect,
  authorize("college_admin", "super_admin"),
  getEventParticipants
);

/*
  Approve / Reject Registration
  Endpoint: PATCH /api/registrations/:id/status
*/
router.patch(
  "/:id/status",
  protect,
  authorize("college_admin", "super_admin"),
  updateRegistrationStatus
);

/*
  Super Admin events-overview
  Endpoint: GET /api/registrations/overview
*/
router.get(
  "/overview", 
  protect,
  authorize("super_admin"),
  getPlatformEvents
);


/*
  College Admin delete event
  Endpoint: GET /api/registrations/event/:eventId/delete
*/
router.delete(
  "/event/:eventId/delete", 
  protect,
  authorize("college_admin", "super_admin"),
  deleteEvent
);

export default router;