import express from "express";
import { createComment, getEventComments } from "../controllers/comment.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyAuth, createComment);
router.get("/event/:eventId", getEventComments);

export default router;
