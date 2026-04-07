// src/services/registration.service.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* Register for Event */
export const createRegistration = async (eventId, userId) => {

  // ===== ADDED CODE : Get user information =====
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // ===== ADDED CODE : Only students can register =====
  if (user.role === "college_admin" || user.role === "super_admin") {
    throw new Error("Admins cannot register for events");
  }

  // ===== ADDED CODE : Get event details =====
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // ===== ADDED CODE : Allow only college events or global events =====
  if (
    event.scope !== "GLOBAL" &&
    event.collegeId !== user.collegeId
  ) {
    throw new Error(
      "You can only register for events hosted by your college or global events"
    );
  }

  // ===== ADDED CODE : Prevent duplicate registration =====
  const existingRegistration = await prisma.registration.findFirst({
    where: {
      eventId,
      userId,
    },
  });

  if (existingRegistration) {
    throw new Error("You have already registered for this event");
  }

  // ===== ORIGINAL CODE =====
  return prisma.registration.create({
    data: {
      eventId,
      userId,
      status: "PENDING", // ensures registration status tracking
    },
  });
};

/* Get My Registrations */
export const getMyRegistrations = async (userId) => {
  return prisma.registration.findMany({
    where: { userId },
    include: {
      event: true,
    },
    orderBy: {
      timestamp: "desc",
    },
  });
};

/* Update Registration Status (Admin) */
export const updateRegistrationStatus = async (id, status) => {
  return prisma.registration.update({
    where: { id },
    data: { status },
    include: {
      user: true,
      event: true,
    },
  });
};

/* Get Event Registrations (Admin) */
export const getEventRegistrations = async (eventId) => {
  return prisma.registration.findMany({
    where: { eventId },
    include: {
      user: true,
    },
    orderBy: {
      timestamp: "desc",
    },
  });
};

/* Cancel Registration */
export const deleteRegistration = async (id, userId, role) => {
  // Adjust role check based on your Role enum
  if (role === "college_admin" || role === "super_admin") {
    return prisma.registration.delete({
      where: { id },
    });
  }

  return prisma.registration.deleteMany({
    where: {
      id,
      userId,
    },
  });
};