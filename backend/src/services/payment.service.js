// src/services/payment.service.js

import prisma from "../config/prisma.js";

export const simulatePaymentService = async (data, user) => {
  const { eventId, amount } = data;

  if (user.role !== "student") {
    throw new Error("Only students can make payments for events");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new Error("Event not found");
  }

  if (!event.isPaid) {
    throw new Error("This event is not a paid event");
  }

  // Simulate payment processing...
  const paymentSuccess = Math.random() > 0.1; // 90% success rate

  if (!paymentSuccess) {
    throw new Error("Payment failed. Please try again.");
  }

  return {
    transactionId: `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    status: "SUCCESS",
    amountPaid: amount || event.ticketPrice,
    timestamp: new Date()
  };
};
