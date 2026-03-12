import prisma from "../config/prisma.js";


export const registerForEventService = async (eventId, user) => {

  if (user.role !== "student") {
    throw new Error("Only students can register for events");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new Error("Event not found");
  }

  if (new Date(event.startDate) < new Date()) {
    throw new Error("Event registration closed");
  }

  // scope validation
  if (
    event.scope === "COLLEGE" &&
    event.collegeId !== user.collegeId
  ) {
    throw new Error("You can only register for events hosted by your college");
  }

  const existing = await prisma.registration.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId: user.id
      }
    }
  });

  if (existing) {
    throw new Error("Already registered for this event");
  }

  return prisma.registration.create({
    data: {
      eventId,
      userId: user.id
    }
  });
};

export const getMyRegistrationsService = async (user) => {

  return prisma.registration.findMany({
    where: {
      userId: user.id
    },
    include: {
      event: {
        include: {
          college: true
        }
      }
    },
    orderBy: {
      timestamp: "desc"
    }
  });

};

export const getEventParticipantsService = async (eventId, admin) => {

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new Error("Event not found");
  }

  if (event.collegeId !== admin.collegeId) {
    throw new Error("You can only manage events from your college");
  }

  return prisma.registration.findMany({
    where: { eventId },
    include: {
      user: true
    }
  });

};


export const updateRegistrationStatusService = async (
  registrationId,
  status,
  admin
) => {

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { event: true }
  });

  if (!registration) {
    throw new Error("Registration not found");
  }

  if (registration.event.collegeId !== admin.collegeId) {
    throw new Error("You can only manage events from your college");
  }

  return prisma.registration.update({
    where: { id: registrationId },
    data: { status }
  });

};

export const getPlatformEventsService = async () => {

  return prisma.event.findMany({
    include: {
      college: true,
      creator: true,
      _count: {
        select: {
          registrations: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

};

//DELETE EVENT
export const deleteEventService = async (eventId, user) => {

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new Error("Event not found");
  }

  if (user.role === "college_admin") {

    if (event.collegeId !== user.collegeId) {
      throw new Error("You can only manage events from your college");
    }

  } else if (user.role === "super_admin") {

    if (event.createdBy !== user.id) {
      throw new Error("You can only manage events you created");
    }

  }

  return prisma.event.delete({
    where: { id: eventId }
  });

};

//UPDATE EVENT
export const updateEventService = async (eventId, data, user) => {

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new Error("Event not found");
  }

  if (user.role === "college_admin") {

    if (event.collegeId !== user.collegeId) {
      throw new Error("You can only manage events from your college");
    }

  } else if (user.role === "super_admin") {

    if (event.createdBy !== user.id) {
      throw new Error("You can only manage events you created");
    }

  }

  return prisma.event.update({
    where: { id: eventId },
    data
  });

};