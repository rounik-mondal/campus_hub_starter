import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createFeedbackService = async (eventId, user, rating, comments) => {
  // Verify the event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // Ensure the user is actually registered and approved
  const registration = await prisma.registration.findFirst({
    where: {
      eventId,
      userId: user.id,
      status: "approved"
    }
  });

  if (!registration) {
    throw new Error("You must be registered and approved for this event to leave feedback.");
  }

  // Check if feedback already exists
  const existingFeedback = await prisma.feedback.findFirst({
    where: {
      eventId,
      userId: user.id
    }
  });

  if (existingFeedback) {
    return prisma.feedback.update({
      where: { id: existingFeedback.id },
      data: { rating, comments, timestamp: new Date() }
    });
  }

  return prisma.feedback.create({
    data: {
      eventId,
      userId: user.id,
      rating,
      comments
    }
  });
};

export const getEventFeedbacksService = async (eventId, loggedInAdmin = null) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // If fetched by college_admin, verify identity
  if (loggedInAdmin && loggedInAdmin.role === "college_admin") {
    if (event.collegeId !== loggedInAdmin.collegeId) {
      throw new Error("Unauthorized to view feedbacks for this event.");
    }
  }

  return prisma.feedback.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      timestamp: 'desc'
    }
  });
};
