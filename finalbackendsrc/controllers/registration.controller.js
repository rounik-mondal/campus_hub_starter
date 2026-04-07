// src/controllers/registration.controller.js

import * as registrationService from "../services/registration.service.js";

export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    const registration = await registrationService.createRegistration(
      eventId,
      req.user.id
    );

    res.status(201).json(registration);
  } catch (error) {

    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "Already registered for this event" });
    }

    if (error.message) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};

export const myRegistrations = async (req, res) => {
  try {
    const registrations = await registrationService.getMyRegistrations(
      req.user.id
    );
    res.json(registrations);
  } catch (error) {

    if (error.message) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};


export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    
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

    
    if (error.message) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};