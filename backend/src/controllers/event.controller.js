// src/controllers/event.controller.js

import {
    createEventService,
    getAllEventsService,
    getEventByIdService,
} from "../services/event.service.js";

export const createEvent = async (req, res) => {
    try {
        // pass full user
        const event = await createEventService(req.body, req.user);

        res.status(201).json({
            message: "Event created successfully",
            event,
        });
    } catch (err) {
        res.status(400).json({
            message: err.message,
        });
    }
};

export const getAllEvents = async (req, res) => {
    try {
        // pass user for visibility filtering
        const events = await getAllEventsService(req.query, req.user);

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

export const getEventById = async (req, res) => {
    try {
        const event = await getEventByIdService(req.params.id, req.user);
        res.json(event);
    } catch (err) {
        res.status(404).json({
            message: err.message,
        });
    }
};