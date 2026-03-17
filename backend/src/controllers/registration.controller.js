import {
  registerForEventService,
  cancelRegistrationService,
  getMyRegistrationsService,
  updateRegistrationStatusService,
  getEventParticipantsService,
  getPlatformEventsService,
  deleteEventService,
  updateEventService, //TASK 1 --> Should be for college and super admins, for their respective events.
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

//TASK 2
//it can create abuse. student might register and de-register frequently, introduce rate limiting or if once cancelled cannot register again.
//logic can be, adding one more enum to registration status, and on cancellation the status of the registration should turn to cancelled hence not allowing the student to abuse.
export const cancelRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;

    const registration = await cancelRegistrationService(
      eventId,
      req.user
    );

    res.status(201).json({
      message: "Registration cancelled successfully.",
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

// TODO: 
// introduce seats while admins are creating event and implement a automated algorithm that will suspend the booking if the seats are full. 

// introduce if payment is required or not to register for the event + simulate the payment flow 

// introduce adding teamates, if it is allowed by the admins while creating the events (admins will decide maximum number of participant in each team) + adding teamate will be on the basis of email id. checks can be implemented that is if the email id exists, the respecive student name will be shown and can be added to the team and a request will go to their account and if they accept they will be joining for the event with the person who invited. (Optional Feature)

// introduce qr + add to calender or .ics on successfull registration for events. 

//Invitation Schema: To track invite status of Teammates 

//super admin should have proper data for how many colleges are there and how many admins are there and how many students are there with proper visualisation that is who belongs where --> will reduce data redundancy. (Core feature)
