// src/services/event.service.js

import prisma from "../config/prisma.js";


// CREATE EVENT
export const createEventService = async (data, user) => {
  if (!["college_admin", "super_admin"].includes(user.role)) {
    throw new Error("Not authorized to create events");
  }

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
      collegeId: user.collegeId,
      createdBy: user.id, // NEW: track who created the event
    },
  });

  return event;
};


// GET ALL EVENTS
export const getAllEventsService = async (filters, user) => {
  const { category } = filters;

  const where = {};

  if (category) where.category = category;

  if (!user) {
    where.scope = "GLOBAL";
  } 
  else if (user.role === "student") {
    where.OR = [
      { scope: "GLOBAL" },
      {
        scope: "COLLEGE",
        collegeId: user.collegeId ?? "__none__",
      },
    ];
  } 
  else if (user.role === "college_admin") {
    where.OR = [
      { scope: "GLOBAL" },
      {
        scope: "COLLEGE",
        collegeId: user.collegeId ?? "__none__",
      },
    ];
  }

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

  if (event.scope === "GLOBAL") {
    return event;
  }

  if (!user) {
    throw new Error("Event not found");
  }

  if (user.role === "super_admin") {
    return event;
  }

  if (user.collegeId && user.collegeId === event.collegeId) {
    return event;
  }

  throw new Error("Event not found");
};



// UPDATE EVENT
export const updateEventService = async (eventId, data, user) => {

  if (!["college_admin", "super_admin"].includes(user.role)) {
    throw new Error("Not authorized to update events");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // College Admin Rule (existing logic)
  if (user.role === "college_admin" && event.collegeId !== user.collegeId) {
    throw new Error("You can only manage events of your college");
  }

  // Super Admin Rule (NEW)
  if (user.role === "super_admin" && event.createdBy !== user.id) {
    throw new Error("Super Admin can only manage events created by themselves");
  }

  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined
    }
  });

  return updatedEvent;
};




// DELETE EVENT
export const deleteEventService = async (eventId, user) => {

  if (!["college_admin", "super_admin"].includes(user.role)) {
    throw new Error("Not authorized to delete events");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // College Admin Rule
  if (user.role === "college_admin" && event.collegeId !== user.collegeId) {
    throw new Error("You can only delete events of your college");
  }

  // Super Admin Rule (NEW)
  if (user.role === "super_admin" && event.createdBy !== user.id) {
    throw new Error("Super Admin can only delete events created by themselves");
  }

  await prisma.event.delete({
    where: { id: eventId }
  });

  return { message: "Event deleted successfully" };
};




// GET EVENT PARTICIPANTS
export const getEventParticipantsService = async (eventId, user) => {

  if (!["college_admin", "super_admin"].includes(user.role)) {
    throw new Error("Not authorized to view participants");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // College Admin Rule
  if (user.role === "college_admin" && event.collegeId !== user.collegeId) {
    throw new Error("You can only view participants of your college events");
  }

  // Super Admin Rule (NEW)
  if (user.role === "super_admin" && event.createdBy !== user.id) {
    throw new Error("Super Admin can only view participants of their events");
  }

  const participants = await prisma.registration.findMany({
    where: { eventId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return participants;
};




// GET PARTICIPANT COUNT
export const getParticipantCountService = async (eventId, user) => {

  if (!["college_admin", "super_admin"].includes(user.role)) {
    throw new Error("Not authorized to view participant count");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // College Admin Rule
  if (user.role === "college_admin" && event.collegeId !== user.collegeId) {
    throw new Error("You can only view your college events");
  }

  // Super Admin Rule (NEW)
  if (user.role === "super_admin" && event.createdBy !== user.id) {
    throw new Error("Super Admin can only view participant count of their events");
  }

  const count = await prisma.registration.count({
    where: { eventId }
  });

  return {
    eventId,
    totalParticipants: count
  };
};