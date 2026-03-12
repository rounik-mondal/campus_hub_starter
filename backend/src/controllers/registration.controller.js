import {
  registerForEventService,
  getMyRegistrationsService,
  updateRegistrationStatusService,
  getEventParticipantsService,
  getPlatformEventsService,
  deleteEventService,
  updateEventService, //task
} from "../services/registration.service.js";


export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const registration = await registerForEventService(
      eventId,
      req.user
    );

    res.status(201).json({
      message: "Successfully registered for event",
      registration,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};


export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await getMyRegistrationsService(req.user);

    res.json({
      count: registrations.length,
      registrations,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


export const updateRegistrationStatus = async (req, res) => {
  try {
    const { id: registrationId } = req.params;
    const { status } = req.body;

    const updated = await updateRegistrationStatusService(
      registrationId,
      status,
      req.user
    );

    res.json({
      message: "Registration status updated",
      registration: updated,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};



export const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;

    const participants = await getEventParticipantsService(
      eventId,
      req.user
    );

    res.json({
      count: participants.length,
      participants,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const getPlatformEvents = async (req, res) => {
  try {
    const events = await getPlatformEventsService();

    res.json({
      count: events.length,
      events,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await deleteEventService(eventId, req.user);

        res.status(201).json({
            message: "Event deleted successfully",
            event,
        });
    } catch (err) {
        res.status(400).json({
            message: err.message,
        });
    }
};