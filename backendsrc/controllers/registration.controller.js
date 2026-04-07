// src/controllers/registration.controller.js

import * as registrationService from "../services/registration.service.js";

/* Student Register */
export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    const registration = await registrationService.createRegistration(
      eventId,
      req.user.id
    );

    res.status(201).json(registration);
  } catch (error) {

    // ===== ADDED CODE : Prisma duplicate error =====
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "Already registered for this event" });
    }

    // ===== ADDED CODE : Service validation errors =====
    if (error.message) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};

/* Student: My Registrations */
export const myRegistrations = async (req, res) => {
  try {
    const registrations = await registrationService.getMyRegistrations(
      req.user.id
    );
    res.json(registrations);
  } catch (error) {

    // ===== ADDED CODE : Better error handling =====
    if (error.message) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};

/* Admin: Update Status */
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    //STATUS VALIDATION
    const allowedStatus = ["pending", "approved", "rejected"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await registrationService.updateRegistrationStatus(
      id,
      status
    );

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* Admin: Get Event Registrations */
export const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;

    const registrations =
      await registrationService.getEventRegistrations(eventId);

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* Cancel Registration */
export const cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    await registrationService.deleteRegistration(
      id,
      req.user.id,
      req.user.role
    );

    res.json({ message: "Registration cancelled successfully" });
  } catch (error) {

    // ===== ADDED CODE : Show service error =====
    if (error.message) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};