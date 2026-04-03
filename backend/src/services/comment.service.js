import prisma from "../config/prisma.js";

export const createCommentService = async (data) => {
  const { eventId, userId, content, parentId } = data;

  // Make sure event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // If parentId exists, ensure parent comment belongs to same event
  if (parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId }
    });
    if (!parentComment) throw new Error("Parent comment not found");
    if (parentComment.eventId !== eventId) {
        throw new Error("Parent comment does not belong to this event");
    }
    // ensure no infinite nesting (limit to 1 level depth)
    if (parentComment.parentId) {
        throw new Error("Nested replies to replies are not allowed");
    }
  }

  const comment = await prisma.comment.create({
    data: {
      eventId,
      userId,
      content,
      parentId
    },
    include: {
      user: {
        select: { name: true, email: true, role: true }
      }
    }
  });

  return comment;
};

export const getEventCommentsService = async (eventId) => {
  const comments = await prisma.comment.findMany({
    where: { 
        eventId,
        parentId: null // Only fetch root comments directly
    },
    include: {
      user: {
        select: { name: true, email: true, role: true }
      },
      replies: {
        include: {
            user: {
                select: { name: true, email: true, role: true }
            }
        },
        orderBy: { timestamp: "asc" }
      }
    },
    orderBy: {
      timestamp: "desc"
    }
  });

  return comments;
};
