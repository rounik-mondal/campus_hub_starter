// src/controllers/team.controller.js

import {
  createTeamService,
  inviteToTeamService,
  respondToInviteService,
  getMyTeamByEventService,
  getMyPendingInvitationsService,
  payForInviteService,
  adminApproveInviteService
} from "../services/team.service.js";

export const createTeam = async (req, res) => {
  try {
    const { eventId } = req.body;
    const team = await createTeamService(eventId, req.user);
    res.status(201).json({ message: "Team created successfully", team });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const inviteToTeam = async (req, res) => {
  try {
    const { teamId, inviteeEmail } = req.body;
    const { invitation, invitee } = await inviteToTeamService(teamId, inviteeEmail, req.user);
    res.status(201).json({ 
      message: "Invitation sent successfully", 
      invitedUser: { name: invitee.name, email: invitee.email },
      invitation: { status: invitation.status }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const respondToInvite = async (req, res) => {
  try {
    const { invitationId, status } = req.body; // "accepted" or "declined"
    const response = await respondToInviteService(invitationId, status, req.user);
    res.status(200).json({ message: `Invitation ${status}`, response });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getTeamByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const team = await getMyTeamByEventService(eventId, req.user);
    res.status(200).json({ team });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getPendingInvitations = async (req, res) => {
  try {
    const invites = await getMyPendingInvitationsService(req.user);
    res.status(200).json({ invitations: invites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const payForInvite = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await payForInviteService(id, req.user);
    res.status(200).json({ message: "Payment recorded", response });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const adminApproveInvite = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approved" or "declined"
    const response = await adminApproveInviteService(id, status, req.user);
    res.status(200).json({ message: `Invite ${status}`, response });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
