// src/services/registration.service.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createRegistration = async (eventId, userId) => {

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "college_admin" || user.role === "super_admin") {
    throw new Error("Admins cannot register for events");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  if (event.scope !== "GLOBAL" && event.collegeId !== user.collegeId) {
    throw new Error(
      "You can only register for events hosted by your college or global events"
    );
  }

  const existingRegistration = await prisma.registration.findFirst({
    where: {
      eventId,
      userId,
    },
  });

  if (existingRegistration) {
    throw new Error("You have already registered for this event");
  }

  return prisma.registration.create({
    data: {
      eventId,
      userId,
      status: "PENDING",
    },
  });
};



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




export const updateRegistrationStatus = async (id, status, adminUser) => {

  if (!["college_admin", "super_admin"].includes(adminUser.role)) {
    throw new Error("Only admins can update registration status");
  }

  const registration = await prisma.registration.findUnique({
    where: { id },
    include: {
      event: true,
      user: true,
    },
  });

  if (!registration) {
    throw new Error("Registration not found");
  }

  // College Admin Rule
  if (
    adminUser.role === "college_admin" &&
    registration.event.collegeId !== adminUser.collegeId
  ) {
    throw new Error("You can only manage registrations of your college events");
  }

  // Super Admin Rule (NEW)
  if (
    adminUser.role === "super_admin" &&
    registration.event.createdBy !== adminUser.id
  ) {
    throw new Error(
      "Super Admin can only manage registrations of events created by themselves"
    );
  }

  return prisma.registration.update({
    where: { id },
    data: { status },
    include: {
      user: true,
      event: true,
    },
  });
};




export const getEventRegistrations = async (eventId, adminUser) => {

  if (!["college_admin", "super_admin"].includes(adminUser.role)) {
    throw new Error("Only admins can view registrations");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // College Admin Rule
  if (
    adminUser.role === "college_admin" &&
    event.collegeId !== adminUser.collegeId
  ) {
    throw new Error("You can only view registrations of your college events");
  }

  // Super Admin Rule (NEW)
  if (
    adminUser.role === "super_admin" &&
    event.createdBy !== adminUser.id
  ) {
    throw new Error(
      "Super Admin can only view registrations of events created by themselves"
    );
  }

  return prisma.registration.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      timestamp: "desc",
    },
  });
};




export const deleteRegistration = async (id, userId, role, userCollegeId) => {

  if (role === "college_admin") {

    const registration = await prisma.registration.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!registration) {
      throw new Error("Registration not found");
    }

    if (registration.event.collegeId !== userCollegeId) {
      throw new Error("You can only delete registrations of your college events");
    }

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