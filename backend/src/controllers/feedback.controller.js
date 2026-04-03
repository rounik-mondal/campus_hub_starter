import { createFeedbackService, getEventFeedbacksService } from "../services/feedback.service.js";

export const createFeedback = async (req, res) => {
  try {
    const { eventId, rating, comments } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const feedback = await createFeedbackService(eventId, req.user, rating, comments);

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getEventFeedbacks = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const feedbacks = await getEventFeedbacksService(eventId, req.user);

    res.status(200).json({
      feedbacks
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
