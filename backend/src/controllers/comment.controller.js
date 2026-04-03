import { createCommentService, getEventCommentsService } from "../services/comment.service.js";

export const createComment = async (req, res) => {
  try {
    const { eventId, content, parentId } = req.body;
    const userId = req.user.id;

    if (!eventId || !content) {
      return res.status(400).json({ message: "eventId and content are required" });
    }

    const comment = await createCommentService({ eventId, userId, content, parentId });
    res.status(201).json({ message: "Comment created successfully", comment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getEventComments = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      return res.status(400).json({ message: "eventId is required" });
    }

    const comments = await getEventCommentsService(eventId);
    res.status(200).json({ comments });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
