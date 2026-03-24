// src/routes/team.routes.js

import { Router } from "express";
import {
  createTeam,
  inviteToTeam,
  respondToInvite,
  getTeamByEvent,
  getPendingInvitations,
  searchUsers
} from "../controllers/team.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyAuth);

router.post("/", createTeam);
router.get("/search-users", searchUsers);
router.post("/invite", inviteToTeam);
router.post("/respond", respondToInvite);
router.get("/event/:eventId", getTeamByEvent);

export default router;
