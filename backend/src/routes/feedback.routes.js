import express from "express";
import { createFeedback, getEventFeedbacks } from "../controllers/feedback.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyAuth, createFeedback);
router.get("/event/:eventId", verifyAuth, getEventFeedbacks);

export default router;
