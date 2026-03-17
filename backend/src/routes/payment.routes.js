// src/routes/payment.routes.js

import { Router } from "express";
import { simulatePayment } from "../controllers/payment.controller.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyAuth);

router.post("/simulate", simulatePayment);

export default router;
