import express from "express";
import { getAdminLogs } from "../controllers/adminLog.controller.js";
import { verifyAuth, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyAuth, authorize("super_admin"), getAdminLogs);

export default router;
