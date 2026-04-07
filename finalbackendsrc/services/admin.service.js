// src/services/admin.service.js

import prisma from "../config/prisma.js";


export const getPlatformOverviewService = async (user) => {

  if (user.role !== "super_admin") {
    throw new Error("Only super admins can access platform overview");
  }

  const events = await prisma.event.findMany({
    include: {
      college: {
        select: {
          id: true,
          name: true,
        },
      },
      registrations: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      startDate: "asc",
    },
  });

  const overview = events.map((event) => ({
    eventId: event.id,
    title: event.title,
    category: event.category,
    scope: event.scope,

    createdBy: event.creator
      ? {
          id: event.creator.id,
          name: event.creator.name,
          email: event.creator.email,
        }
      : null,

    college: event.college
      ? {
          id: event.college.id,
          name: event.college.name,
        }
      : null,

    totalParticipants: event.registrations.length,
  }));

  return overview;
};