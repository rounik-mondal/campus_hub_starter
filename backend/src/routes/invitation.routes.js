// src/routes/invitation.routes.js

import { Router } from "express";
import {
  respondToInvite,
  payForInvite,
  adminApproveInvite,
  getPendingInvitations
} from "../controllers/team.controller.js";
import { verifyAuth, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyAuth);

// Feature 6 endpoint requirements
router.get("/", getPendingInvitations);
router.post("/accept", (req, res) => {
  req.body.status = "accepted";
  return respondToInvite(req, res);
});
router.post("/decline", (req, res) => {
  req.body.status = "declined";
  return respondToInvite(req, res);
});

router.post("/:id/pay", authorize("student"), payForInvite);
router.post("/:id/approve", authorize("college_admin", "super_admin"), adminApproveInvite);

export default router;
