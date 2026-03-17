import prisma from "../config/prisma.js";
import { generateQRCodePayload, generateICSCalendar } from "./qr-ics.service.js";


export const registerForEventService = async (eventId, user) => {

  if (user.role !== "student") {
    throw new Error("Only students can register for events");
  }

  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error("Event not found");
    }

    if (new Date(event.endDate) < new Date()) {
      throw new Error("Event registration closed");
    }

    // scope validation
    if (
      event.scope === "COLLEGE" &&
      event.collegeId !== user.collegeId
    ) {
      throw new Error("You can only register for events hosted by your college");
    }

    const existing = await tx.registration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: user.id
        }
      }
    });

    if (existing) {
      if (existing.status === "CANCELLED") {
        throw new Error("You have cancelled your registration for this event and cannot register again");
      }
      throw new Error("Already registered for this event");
    }

    const approvedCount = await tx.registration.count({
      where: { eventId, status: "approved" }
    });

    if (approvedCount >= event.maxSeats) {
      throw new Error("EVENT_FULL: No more seats available for this event");
    }

    const registration = await tx.registration.create({
      data: {
        eventId,
        userId: user.id
      }
    });

    if (event.isTeamEvent) {
      const existingTeam = await tx.teamMember.findFirst({
        where: { userId: user.id, team: { eventId } }
      });

      if (!existingTeam) {
        const team = await tx.team.create({
          data: {
            eventId,
            createdBy: user.id
          }
        });
        await tx.teamMember.create({
          data: {
            teamId: team.id,
            userId: user.id,
            role: "CREATOR"
          }
        });
      }
    }

    const qrPayload = generateQRCodePayload(eventId, user.id, registration.id);
    const icsData = generateICSCalendar(event);

    return {
      ...registration,
      qrPayload,
      icsData
    };
  });
};

export const cancelRegistrationService = async (eventId, user) => {

  /* Only students cancel their own registrations */
  if (user.role !== "student") {
    throw new Error("Only students can cancel registrations");
  }

  const registration = await prisma.registration.findFirst({
    where: { eventId, userId: user.id }
  });

  if (!registration) {
    throw new Error("Registration not found");
  }

  if (registration.status === "CANCELLED") {
    throw new Error("Registration is already cancelled");
  }

  // Instead of deleting, we update status to CANCELLED
  return prisma.registration.update({
    where: {
      id: registration.id,
    },
    data: {
      status: "CANCELLED"
    }
  });
};

export const getMyRegistrationsService = async (user) => {

  const registrations = await prisma.registration.findMany({
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

  const enriched = await Promise.all(registrations.map(async (reg) => {
    let teamInfo = null;
    let invitations = [];

    if (reg.event.isTeamEvent) {
      const teamMemberRecord = await prisma.teamMember.findFirst({
        where: { userId: user.id, team: { eventId: reg.eventId } },
        include: {
          team: {
            include: {
              members: { include: { user: { select: { name: true, email: true } } } },
              invitations: true
            }
          }
        }
      });
      
      if (teamMemberRecord) {
        teamInfo = teamMemberRecord.team;
        invitations = teamInfo.invitations;
      }
    }

    const qrPayload = generateQRCodePayload(reg.eventId, user.id, reg.id);

    return {
      ...reg,
      qrPayload,
      team: teamInfo,
      invitations
    };
  }));

  return enriched;
};

export const getEventParticipantsService = async (eventId, admin) => {

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new Error("Event not found");
  }

  if (admin.role === "college_admin") {
    if (event.collegeId !== admin.collegeId && event.createdBy !== admin.id) {
      throw new Error("You can only manage events from your college or created by you");
    }
  } else if (admin.role !== "super_admin") {
    throw new Error("Not authorized");
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

  if (admin.role === "college_admin") {
    if (registration.event.collegeId !== admin.collegeId && registration.event.createdBy !== admin.id) {
      throw new Error("You can only manage events from your college or created by you");
    }
  } else if (admin.role === "super_admin") {
    throw new Error("Super admin cannot manage registrations unless explicitly allowed");
  } else {
    throw new Error("Not authorized");
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
          registrations: {
            where: { status: "approved" }
          }
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

