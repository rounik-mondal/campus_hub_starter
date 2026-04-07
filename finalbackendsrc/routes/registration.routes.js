import express from "express";
import * as registrationController from "../controllers/registration.controller.js";

import { protect, authorize } from "../middlewares/auth.middleware.js";
import { optionalProtect } from "../middlewares/optionalAuth.middleware.js";

const router = express.Router();

router.post("/", protect, registrationController.registerForEvent);

router.get("/me", protect, registrationController.myRegistrations);

router.delete("/:id", protect, registrationController.cancelRegistration);


/* Approve or Reject registration */
router.patch(
  "/status/:id",
  protect,
  authorize("college_admin"),
  registrationController.updateStatus
);

/* View registrations of an event */
router.get(
  "/event/:eventId",
  protect,
  authorize("college_admin"),
  registrationController.getEventRegistrations
);

export default router;