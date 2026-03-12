// src/services/event.service.js

import prisma from "../config/prisma.js";

// CREATE EVENT
export const createEventService = async (data, user) => {
  // only admins allowed (extra safety)
  if (!["college_admin", "super_admin"].includes(user.role)) {
    throw new Error("Not authorized to create events");
  }

  // college admin must belong to a college
  if (!user.collegeId) {
    throw new Error("Admin is not mapped to any college");
  }

  const { title, description, category, location, startDate, endDate, scope } =
    data;

  const event = await prisma.event.create({
    data: {
      title,
      description,
      category,
      location,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      scope: scope ?? "COLLEGE",

      // CRITICAL: always from token, never from body
      collegeId: user.collegeId,
      createdBy: user.id,
    },
  });

  return event;
};

// GET ALL EVENTS (role-aware)
export const getAllEventsService = async (filters, user) => {
  const { category } = filters;

  const where = {};

  if (category) where.category = category;

  // VISIBILITY ENFORCEMENT

  // Case 1: guest
  if (!user) {
    where.scope = "GLOBAL";
  }

  // Case 2: student
  else if (user.role === "student") {
    where.OR = [
      { scope: "GLOBAL" },
      {
        scope: "COLLEGE",
        collegeId: user.collegeId ?? "__none__",
      },
    ];
  }

  // Case 3: college_admins
  else if (user.role === "college_admin") {
    where.OR = [
      { scope: "GLOBAL" },
      {
        scope: "COLLEGE",
        collegeId: user.collegeId ?? "__none__",
      },
    ];
  }

  // Case 4: super_admin see all (no extra filter)


  const events = await prisma.event.findMany({
    where,
    orderBy: { startDate: "asc" },
    include: {
      college: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return events;
};


// GET EVENT BY ID
export const getEventByIdService = async (id, user) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      college: true,
      registrations: true,
      feedbacks: true,
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // VISIBILITY ENFORCEMENT

  // GLOBAL → always allowed
  if (event.scope === "GLOBAL") {
    return event;
  }

  // From here → COLLEGE scoped event

  // guest cannot access
  if (!user) {
    throw new Error("Event not found");
  }

  // super_admin can access
  if (user.role === "super_admin") {
    return event;
  }

  // same-college users can access
  if (user.collegeId && user.collegeId === event.collegeId) {
    return event;
  }

  // everyone else blocked
  throw new Error("Event not found");
};