// src/services/team.service.js

import prisma from "../config/prisma.js";

export const createTeamService = async (eventId, user) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Event not found");
  if (!event.isTeamEvent) throw new Error("This is not a team event");

  const existingTeam = await prisma.teamMember.findFirst({
    where: { userId: user.id, team: { eventId } }
  });
  if (existingTeam) throw new Error("You are already in a team for this event");

  return prisma.$transaction(async (tx) => {
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

    return team;
  });
};

export const inviteToTeamService = async (teamId, inviteeEmail, user) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { event: true, members: true, invitations: { where: { status: { in: ["pending", "payment_pending", "awaiting_admin_approval", "accepted"] } } } }
  });
  
  if (!team) throw new Error("Team not found");
  if (team.createdBy !== user.id) throw new Error("Only team creator can invite");
  
  const activeMembersAndInvites = team.members.length + team.invitations.length;
  if (activeMembersAndInvites >= team.event.maxTeamSize) {
    throw new Error("Team size exceeds event.maxTeamSize");
  }

  if (inviteeEmail === user.email) throw new Error("You cannot invite yourself");

  const invitee = await prisma.user.findUnique({ where: { email: inviteeEmail } });
  if (!invitee) throw new Error("User with that email not found");
  if (invitee.role !== "student") throw new Error("Only students can be invited to a team");

  if (team.event.scope === "COLLEGE" && invitee.collegeId !== team.event.collegeId) {
    throw new Error("Student must belong to the same college for this event.");
  }

  const existingMember = await prisma.teamMember.findFirst({
    where: { userId: invitee.id, team: { eventId: team.eventId } }
  });
  if (existingMember) throw new Error("User is already in a team for this event");

  const existingRegistration = await prisma.registration.findFirst({
    where: { userId: invitee.id, eventId: team.eventId, status: "approved" }
  });
  if (existingRegistration) throw new Error("User is already registered for this event individually");

  const existingInvite = await prisma.invitation.findFirst({
    where: { eventId: team.eventId, inviteeEmail, status: { in: ["pending", "payment_pending", "awaiting_admin_approval", "accepted"] } }
  });
  if (existingInvite) throw new Error("User is already invited");

  const approvedCount = await prisma.registration.count({
    where: { eventId: team.eventId, status: "approved" }
  });
  if (approvedCount >= team.event.maxSeats) {
     throw new Error("Event capacity reached");
  }
  if (new Date(team.event.endDate) < new Date()) {
     throw new Error("Event registration closed");
  }

  const invitation = await prisma.invitation.create({
    data: {
      inviterId: user.id,
      inviteeEmail,
      teamId,
      eventId: team.eventId
    }
  });

  return { invitation, invitee };
};

export const respondToInviteService = async (invitationId, status, user) => {
  const invite = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { team: { include: { event: true, members: true } } }
  });

  if (!invite) throw new Error("Invitation not found");
  if (invite.inviteeEmail !== user.email) throw new Error("Not authorized");
  if (invite.status !== "pending") throw new Error("Invitation already processed");

  if (status === "declined") {
    return prisma.invitation.update({
      where: { id: invitationId },
      data: { status: "declined" }
    });
  }

  if (status === "accepted") {
    if (invite.team.members.length >= invite.team.event.maxTeamSize) {
      throw new Error("Team is already full");
    }

    return prisma.$transaction(async (tx) => {
      
      if (invite.team.event.isPaid) {
        // PAID EVENT FLOW: user must pay first
        return tx.invitation.update({
          where: { id: invitationId },
          data: { 
            status: "payment_pending",
            seatReserved: true 
          }
        });
      } else {
        // FREE EVENT FLOW: directly move to awaiting admin approval
        return tx.invitation.update({
          where: { id: invitationId },
          data: { 
            status: "awaiting_admin_approval",
            seatReserved: true 
          }
        });
      }
    });
  }
};

export const getMyTeamByEventService = async (eventId, user) => {
  const teamMember = await prisma.teamMember.findFirst({
    where: { userId: user.id, team: { eventId } },
    include: {
      team: {
        include: {
          members: { include: { user: { select: { id: true, name: true, email: true } } } },
          invitations: { where: { status: "pending" } }
        }
      }
    }
  });
  
  return teamMember ? teamMember.team : null;
};

export const getMyPendingInvitationsService = async (user) => {
  return prisma.invitation.findMany({
    where: { inviteeEmail: user.email, status: "pending" },
    include: {
      team: true,
      event: true,
      inviter: { select: { id: true, name: true, email: true } }
    }
  });
};

export const payForInviteService = async (invitationId, user) => {
  const invite = await prisma.invitation.findUnique({ where: { id: invitationId } });
  if (!invite || invite.inviteeEmail !== user.email) throw new Error("Not authorized");
  if (invite.status !== "payment_pending") throw new Error("Payment not pending");

  return prisma.invitation.update({
    where: { id: invitationId },
    data: { 
      status: "awaiting_admin_approval",
      paymentStatus: "payment_completed"
    }
  });
};

export const adminApproveInviteService = async (invitationId, status, admin) => {
  const invite = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { team: { include: { event: true } } }
  });

  if (!invite) throw new Error("Invite not found");
  if (invite.team.event.collegeId !== admin.collegeId && admin.role !== "super_admin") {
    throw new Error("Not authorized");
  }

  const user = await prisma.user.findUnique({ where: { email: invite.inviteeEmail } });

  if (status === "approved") {
    return prisma.$transaction(async (tx) => {
      await tx.invitation.update({
        where: { id: invitationId },
        data: { status: "accepted" }
      });
      await tx.teamMember.create({
        data: { teamId: invite.teamId, userId: user.id, role: "MEMBER" }
      });
      return tx.registration.create({
        data: { eventId: invite.team.eventId, userId: user.id, status: "approved" }
      });
    });
  } else {
    return prisma.invitation.update({
      where: { id: invitationId },
      data: { status: "declined", paymentStatus: "refunded", seatReserved: false }
    });
  }
};
