import express from "express";

import {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  updateRegistrationStatus,
  getEventParticipants,
  getPlatformEvents,
  deleteEvent
} from "../controllers/registration.controller.js";

import { verifyAuth, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

/*
  Student Registration
  Endpoint: POST /api/registrations/event/:eventId
*/
router.post(
  "/event/:eventId",
  verifyAuth,
  authorize("student"),
  registerForEvent
);

/*
  Student Cancel Registration
  Endpoint: PATCH /api/registrations/cancel/:eventId
*/
router.patch(
  "/cancel/:eventId",
  verifyAuth,
  authorize("student"),
  cancelRegistration
);

/*
  Student View Registrations
  Endpoint: GET /api/registrations/me
*/
router.get(
  "/me",
  verifyAuth,
  authorize("student"),
  getMyRegistrations
);

/*
  Admin View Participants
  Endpoint: GET /api/registrations/event/:eventId/participants
*/
router.get(
  "/event/:eventId/participants",
  verifyAuth,
  authorize("college_admin", "super_admin"),
  getEventParticipants
);

/*
  Approve / Reject Registration
  Endpoint: PATCH /api/registrations/:id/status
*/
router.patch(
  "/:id/status",
  verifyAuth,
  authorize("college_admin", "super_admin"),
  updateRegistrationStatus
);

/*
  Super Admin events-overview
  Endpoint: GET /api/registrations/overview
*/
router.get(
  "/overview", 
  verifyAuth,
  authorize("super_admin"),
  getPlatformEvents
);


/*
  College Admin delete event
  Endpoint: GET /api/registrations/event/:eventId/delete
*/
router.delete(
  "/event/:eventId/delete", 
  verifyAuth,
  authorize("college_admin", "super_admin"),
  deleteEvent
);

export default router;