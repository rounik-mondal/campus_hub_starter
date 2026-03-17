// src/controllers/payment.controller.js

import { simulatePaymentService } from "../services/payment.service.js";

export const simulatePayment = async (req, res) => {
  try {
    const result = await simulatePaymentService(req.body, req.user);

    res.status(200).json({
      message: "Payment successful",
      ...result
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};
